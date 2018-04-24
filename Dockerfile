FROM ubuntu:16.04

RUN apt-get -y update


# update packages and install
RUN apt-get install -y curl

RUN curl -sL https://deb.nodesource.com/setup_8.x | bash
RUN apt-get -y install nodejs



WORKDIR /usr/src/app


