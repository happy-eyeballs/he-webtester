# Happy Eyeballs Webtester

This is the source code for the online Happy Eyeballs webtester: [www.happy-eyeballs.net](https://www.happy-eyeballs.net).
It was initially developed as part of the paper "Lazy Eye Inspection: Capturing the State of Happy Eyeballs Implementations" by Patrick Sattler.
Please use [the provided citation](#citation)

The current development team is:
- [Patrick Sattler](https://www.patricksattler.eu)
- [Johannes Zirngibl](https://zirngibl.github.io)
- Matthias Kirstein
- Tim Betzer



## Install

We use [Ansible](https://docs.ansible.com/ansible/latest/index.html) to automatically setup and deploy this tool to hosts.

### Prerequisites

- [Ansible](https://docs.ansible.com/ansible/latest/index.html) on the local machine
- [Podman](https://podman.io) on the deployment host
- An interface where [tc netem](https://www.man7.org/linux/man-pages/man8/tc-netem.8.html) delay is working (usually needs to be non virtual)
- 2 IPv6 and 2 IPv4 addresses for the nameserver
- One dedicated IPv4 and IPv6 address to check if the client actually supports both IP versions (currently it is not supported to reuse delay addresses, namerserver addresses might work but are untested)
- As many IPv4 and IPv6 addresses as delays should be tested
  - Our default configuration uses 21 delays.

### Configuration

Check the [example configuration file](https://github.com/happy-eyeballs/he-webtester/blob/main/setup/example-hosts) to see a full example.

Main points are:
- `ansible_hosts`: The host were the webtester should be deployed
- `heinterface`: Interface to use when setting up. All used addresses must be configurable on this interface (ansible will add the addresses itself using the `ip` tool)
- `v[6/4]onlyaddress`: The dedicated address to check version availability
- `v6delayprefix`: The prefix where all IPv6 addresses with delay are located in (nameserver and version-only addresses must be outside of this prefix)
- `basepath`: Path where to store the results sent to the server
- `basedomain`: Domain used for the webtests itself (not domain name of webtester; They should be different or the basedomain is a subdomain of an entry in `hedomains`)
- `hedomains`: Domains of the webtester
- `nsaddrs`: Addresses used for the name servers
- `headdresses`: Addreses used for the actual webtesting
  - `address`: The IP address
  - `effective_delay`: delay in ms which should be applied (usually 0 on IPv4)
  - `delay_id`: An id coupling an IPv4 and IPv6 address to it. Every delay_id must have both address versions. The example uses the actual number of delay milliseconds also as its id
  - `classid`: used by tc when an `effective_delay` is applied. Must be a unique hexadecimal number below 0xffff. Used as a minor value with tc


### Ansible

We added several tags to control the setup process:
- addaddrs (adds addresses to the interface). Always included except when skipped
- dropaddrs (deletes addresses to the interface). Never included except when specifically called
- delayconfig - configures the tc delays
- dnssetup
- nginxsetup
- createcerts

To just drop addresses from an interface use --skip-tags=addaddr,delayconfig

## Helpful setup and debug commands
### Enable users to open port 53 and above

`sysctl -w net.ipv4.ip_unprivileged_port_start=53`

### Drop tc config

`tc qdisc del dev ${interface} root`

## Citation

Citation to use when referring to this project:

```
@inproceedings{sattler2025happyeyeballs,
    title = {{Lazy Eye Inspection: Capturing the State of Happy Eyeballs Implementations}},
    author = {Sattler, Patrick and Kirstein, Matthias and Wüstrich, Lars and Zirngibl, Johannes and Carle, Georg},
    booktitle = {Proceedings of the 2025 Internet Measurement Conference},
    year = {2025},
    location = {Madison, WI, USA},
    abbreviation = {IMC'25},
    publisher = {ACM},
    month = oct,
    homepage = {https://www.happy-eyeballs.net/},
    month_numeric = {10}
}
```

