# Happy Eyeballs Webtester

TODO add more info

## Install

ansible tags:
- addaddrs (adds addresses to the interface). Always included except when skipped
- dropaddrs (deletes addresses to the interface). Never included except when specifically called
- delayconfig - configures the tc delays
- dnssetup
- nginxsetup
- createcerts

to just drop addresses from an interface use --skip-tags=addaddr,delayconfig

## drop tc config

`tc qdisc del dev ${interface} root`

## Flush all custom ip6tables rules

`ip6tables -t mangle -F`

## Enable users to open port 53 and above

`sysctl -w net.ipv4.ip_unprivileged_port_start=53`
