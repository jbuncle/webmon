# WebMon

Lightweight website monitoring created in TypeScript, built into and run as single NodeJS script.

The intention is to provide a lightweight (in terms of size and processing) tool for watching websites.
I decided to create this as the free/open source self-hosted alternatives seemed too heavy for running 
on a server with minimal resources.

This is a work in progress, initially just offering email notifications when a site fails tests,
 and logging results to file. The long term intention is to provide a web interface for viewing results.

## Configuration

See configuration.example.json

## Running


### Development/Native

*Requires git & npm*

1. Clone repository `git clone https://github.com/jbuncle/webmon && cd webmon`
2. Install dependencies `npm install`
3. Create log directory `mkdir /var/log/webmon`
4. Create configuration file `cp configuration.example.json configuration.json` and update it accordingly
5. Start the process `npm run start`


### Docker

`docker run -it -v $(pwd)/configuration.json:/etc/webmon/configuration.json jbuncle/webmon`


## Improvements

- Site back up notification email (by watching site go from fail to pass)

