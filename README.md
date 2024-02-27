This project is a utility to sync MySQL data to MeiliSearch in real time. It uses MySQL binlog. Make sure your MySQL `binlog_format` config is set to `ROW`.

```shell
SHOW VARIABLES LIKE 'binlog_format';
```

# How to Deploy

Follow these steps to deploy your application:

### 1. Rename Configuration File

Copy the `.env.example` file and rename it to `.env`.

```shell
cp .env.example .env
```

Copy the `configs.example.json` file and rename it to `configs.json`.

```shell
cp configs.example.json configs.json
```

### 2. Update environment variables and configuration file

Change the `KAFKA_OUTSIDE_HOST` variable in the `.env` file to your routable IP address.

To obtain your routable IP address on your system, you can use the following command (note: this example might not directly apply to Windows, as it's commonly used in Unix-like systems):

```shell
hostname -I | awk '{print $1}'
```

Alternatively, you can use the public IP address of your VPS. However, be aware that using the public IP address is generally considered less secure.

In the config, you see `server_id`, which is the `server_id` of your MySQL database. To get it, go to the MySQL console and run:

```shell
SHOW VARIABLES LIKE 'server_id';
```



### 3. Launch the Application

Always make sure to run on the latest version:

```shell
docker pull nullmastermind/meili-sync-image:latest
```

Run the following command to start your application using Docker Compose:

```shell
docker compose up -d
```