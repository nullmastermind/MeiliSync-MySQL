# How to deploy?

1. Rename `.env.example` to `.env`
2. Change `KAFKA_OUTSIDE_HOST` to `your.routable.ip.address`

To get your routable IP address, use the following command (maybe I don't know, I'm a Windows user):

```shell
hostname -I | awk '{print $1}'
```

You can also use the public IP address of your VPS, but it's less secure.