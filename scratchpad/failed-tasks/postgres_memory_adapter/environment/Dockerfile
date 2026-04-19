FROM ubuntu:24.04

RUN apt-get update -y && \
    DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
        curl ca-certificates git python3 python3-pip python3-pytest bash postgresql postgresql-contrib sudo && \
    curl -fsSL https://deb.nodesource.com/setup_24.x | bash - && \
    apt-get install -y --no-install-recommends nodejs && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

RUN mkdir -p /home/user/myproject && chmod 0755 /home/user

LABEL Author="any-task-builder"
LABEL Description="VoltAgent task environment with Node.js v24 and PostgreSQL installed."

# Configure PostgreSQL to trust local connections
RUN echo "local all all trust" > /etc/postgresql/16/main/pg_hba.conf && \
    echo "host all all 127.0.0.1/32 trust" >> /etc/postgresql/16/main/pg_hba.conf && \
    echo "host all all ::1/128 trust" >> /etc/postgresql/16/main/pg_hba.conf

CMD ["/bin/bash", "-c", "service postgresql start && su - postgres -c \"psql -c \\\"ALTER USER postgres PASSWORD \postgres\\\\\"\" && sleep infinity & wait"]
