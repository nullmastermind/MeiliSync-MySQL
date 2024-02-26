# How to Deploy

Follow these steps to deploy your application:

### 1. Rename Configuration File

Rename the `.env.example` file to `.env`.

```shell
mv .env.example .env
```

### 2. Update Environment Variables

Change the `KAFKA_OUTSIDE_HOST` variable in the `.env` file to your routable IP address.

To obtain your routable IP address on your system, you can use the following command (note: this example might not directly apply to Windows, as it's commonly used in Unix-like systems):

```shell
hostname -I | awk '{print $1}'
```

Alternatively, you can use the public IP address of your VPS. However, be aware that using the public IP address is generally considered less secure.

### 3. Launch the Application

Run the following command to start your application using Docker Compose:

```shell
docker compose up -d
```