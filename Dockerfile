FROM ubuntu:latest

ENV DEBIAN_FRONTEND=noninteractive

RUN \
    apt-get -q update && \
    apt-get -yq install software-properties-common && \
    apt-add-repository ppa:mosquitto-dev/mosquitto-ppa && \
    apt-get -q update && \
    apt-get -yq install mosquitto
EXPOSE 1883
EXPOSE 8883
COPY ./mosquitto.conf /mosquitto.conf

VOLUME [ "/etc/cert" ]

CMD [ "mosquitto", "-c", "/mosquitto.conf"]