FROM python:3.14-slim-trixie

WORKDIR /app

RUN apt update
RUN apt install gcc libexpat1 -y

COPY build/requirements.txt .
RUN pip install -r requirements.txt

COPY src/ .

COPY build/docker-entrypoint.sh .
RUN chmod +x ./docker-entrypoint.sh

ENTRYPOINT [ "./docker-entrypoint.sh" ]
