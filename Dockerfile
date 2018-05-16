# Use multi-stage building
FROM node:8.9.3 as builder

# Define build-time variables
ARG NPM_TOKEN

# create the log directory
WORKDIR /src

# Install node dependencies
COPY    package.json yarn.lock .npmrc ./
ENV     NODE_ENV production
RUN     yarn

# Copy service to src directory
COPY    . .

# Build app stage
FROM      node:8.9.3
WORKDIR   /src

ARG       NPM_TOKEN
ENV       NPM_TOKEN ${NPM_TOKEN}
ENV       LOG_PATH /home/node/app.log
ENV       NODE_ENV production
COPY      --from=builder /src .

# Expose port for api
EXPOSE  8080

# Start application
CMD     ["npm", "run", "start"]
USER    "node"
