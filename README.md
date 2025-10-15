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

We use [Ansible](https://docs.ansible.com/ansible/latest/index.html) to automatically set up and deploy this tool to hosts.

### Prerequisites

- [Ansible](https://docs.ansible.com/ansible/latest/index.html) on the local machine
- [Podman](https://podman.io) on the deployment host
- An interface where [tc netem](https://www.man7.org/linux/man-pages/man8/tc-netem.8.html) delay is working (usually needs to be non virtual)
- 2 IPv6 and 2 IPv4 addresses for the nameserver
- One dedicated IPv4 and IPv6 address to check if the client actually supports both IP versions (currently it is not supported to reuse delay addresses, nameserver addresses might work but are untested)
- As many IPv4 and IPv6 addresses as delays should be tested
  - Our default configuration uses 21 delays.
- 2 dedicated IPv4 and IPv6 addresses for HTTP/3 tests.

### Configuration

Check the [example configuration file](./setup/hosts.yml) for a complete example setup.
The main points to update are the host that the webtester should be deployed to, the domains, network interfaces, IP addresses, and delays.
For detailed explanations of each configuration option, refer to the inline comments within the example config.

### Ansible

After configuring the host in `setup/hosts.yml`, the setup playbook can be run using `ansible-playbook setup/setup.yml -i setup/hosts.yml`.

We added several tags to control the setup process:
- `system`: installs required packages (such as Docker) and creates the user
- `interface`: assigns the configured addresses to the interfaces and configures the tc delays
  - `interface-ip-delete`: include this tag specifically if you want to delete the configured addresses from the interface
- `dns`: sets up the nameserver
- `nginx`: sets up nginx, certificates, and the webtester
- `uploadserver`: sets up the result upload server

Note: all tags have their own "sub-tags" (such as `nginx-certs`) for only executing specific subtasks.
Those can be found in the `tasks/main.yml` inside the individual ansible roles.


## Helpful setup and debug commands

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

