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

#COPY --chown=mosquitto:mosquitto ./CA.crt /CA.crt
#COPY --chown=mosquitto:mosquitto ./server.crt /server.crt
#COPY --chown=mosquitto:mosquitto ./server.key /server.key

CMD [ "mosquitto", "-c", "/mosquitto.conf"]