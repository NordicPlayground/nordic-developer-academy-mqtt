FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive

RUN <<EOT
    apt-get -q update
    apt-get -yq install software-properties-common
    apt-add-repository ppa:mosquitto-dev/mosquitto-ppa
    apt-get -q update
    apt-get -yq install mosquitto
    mkdir /var/log/academy
EOT

RUN <<EOT
    # install Node.js
    apt-get -yq install curl
    # Install Node.js
    curl -O https://nodejs.org/dist/v20.15.1/node-v20.15.1-linux-x64.tar.xz
    tar -xf node-v20.15.1-linux-x64.tar.xz -C /usr/local --strip-components=1
    rm node-v20.15.1-linux-x64.tar.xz
EOT

RUN <<EOT
    apt-get -yq install supervisor
EOT

EXPOSE 1883
EXPOSE 8883
COPY ./mosquitto.conf /mosquitto.conf

COPY metrics /metrics

RUN chmod 777 /var/log/academy
RUN chown 105:106 /var/log/mosquitto

VOLUME [ "/etc/cert" ]

COPY supervisord.conf /etc/supervisor/

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/supervisord.conf"]  