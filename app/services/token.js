const crypto = require('crypto');
const uuidV4 = require('uuid/v4');
const mailer = require('../../library/mail');
const errors = require('../errors');
const Token = require('../models/token');
const User = require('../models/user');

class TokenService {
  create(req) {
    const generatedToken = crypto
      .createHash('sha1')
      .update(uuidV4())
      .digest('hex');
    const { description } = req.params;
    return Promise.resolve()
      .then(() => {
        if (req.faAuth.type === 'personal_access_token') {
          throw new errors.ActionForbidden(
            'Cannot create a personal access token when authenticated with a personal access token.',
          );
        }
      })
      .then(() => {
        return new Token().save(
          {
            token: generatedToken,
            user_id: req.user.id,
            description,
          },
          { user_id: req.user.id },
        );
      })
      .then((token) => {
        mailer.sendEmail(
          req.user.email,
          'A personal access token has been added to your account',
          mailer.templates.tokenGenerated({
            tokenDescription: token.get('description'),
          }),
        );
        // the token needs to be visible the first time it's created and hidden
        // in subsequent requests.
        //
        // by using model.serialize() here, we override the hiding of token.
        // Restify will use the default model.toJSON() to serialize the model
        // in subsequent requests which will apply the visibility options
        return token.serialize();
      });
  }

  getForUser(req) {
    return new User({ id: req.params.userId })
      .fetch({
        withRelated: [
          {
            tokens: (qb) => {
              qb.orderBy('created_at', 'DESC');
            },
          },
        ],
      })
      .then((user) => {
        if (!user) {
          throw new errors.TokenNotFound('Token not found');
        }
        const isOwner = user.get('id') === req.user.id;
        const isSuperAdmin = req.user.superadmin;
        if (isSuperAdmin || isOwner) {
          return {
            results: user.related('tokens').toJSON(),
          };
        }

        throw new errors.ActionForbidden(
          'Access denied. You can only get your own tokens.',
        );
      });
  }

  delete(req) {
    return new Token({ id: req.params.tokenId }).fetch().then((token) => {
      if (!token) {
        throw new errors.TokenNotFound('Token not found');
      }
      const isOwner = token.get('user_id') === req.user.id;
      const isSuperAdmin = req.user.superadmin;
      if (isSuperAdmin || isOwner) {
        return token.destroy();
      }
      throw new errors.ActionForbidden(
        'Token can only be deleted by its owner or a superadmin',
      );
    });
  }
}

module.exports = new TokenService();
