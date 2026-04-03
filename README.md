# @hanthor

a field report

---

Growing up, my bedroom was full of half-disassembled electronics. Things that worked fine until I decided to see what was inside, and then worked less fine, and then became a pile of parts I never quite put back together. The curiosity was always more interesting than the outcome.

GitHub is the same thing, different medium. Repos accumulate the way capacitors and resistors used to — individually harmless, collectively suggestive of a problem.

LLMs did not give me the tinkering habit. They removed the last speed bumps. The gap between "I wonder if I could build a thing that does X" and a working prototype used to be measured in weeks of fighting build systems and reading man pages and discovering that the library you need does not compile on your distro. Now it is measured in afternoons. Someone called it "petrol on ADHD" and I have not found a better description.

This is not a success story. It is a field report from someone who has shipped more code in six months than the rest of their life combined, and is still figuring out what that means.

## The Tour

**[Pasar](https://github.com/hanthor/Pasar)** — I wanted a proper GUI for Homebrew on Linux. Not a terminal. An actual app, with icons, with a list I could scroll through, with Brewfile support so I could see what I had installed. I found an existing macOS Homebrew GUI, added Linux support, kept going. Screenshots, icon fetching from GitHub avatars, Brewfile viewing. Then added native macOS Apple Silicon support because why not. The result is a real application with a CI release workflow and a README that makes it sound more finished than it is. I do not use it. I use the terminal.

**[zerobrew](https://github.com/hanthor/zerobrew)** — Someone rewrote Homebrew in Rust. The pitch: 5–20x faster, drop-in replacement. I thought it was a good idea and spent a weekend adding Linux support and tap/formula parsing so it could find packages beyond the default Homebrew core. Filed the PR upstream. It got merged. Whether zerobrew itself ever becomes a real thing is not my problem. I scratched the itch and left.

**[rancher-desktop-flatpak](https://github.com/hanthor/rancher-desktop-flatpak)** — Rancher Desktop is a full Kubernetes-plus-container-runtime desktop application. On Linux, it wants to install itself in ways that conflict with everything else. I packaged it as a Flatpak — sandboxed, self-contained, installs without fighting the system. One `flatpak install` command. The Flatpak is unsigned, because getting into the official Flathub review queue is a whole thing I have not done. Nobody has opened an issue.

**[lima-container](https://github.com/hanthor/lima-container)** — The idea: run a full VM hypervisor and GUI inside a Podman container, accessible through your browser via noVNC. You spin up the container, open localhost:8006, and you have a dashboard for managing VMs. No KVM driver installed on the host, no libvirt, nothing. The container handles it. There are three image variants: plain, web dashboard, and one that builds VMs directly from bootc container image URIs. It works, mostly.

**[tuna-os/images](https://github.com/tuna-os/tunaOS)** — A matrix of Linux bootc images: different kernels, different desktop environments, different base distros, all built from a shared pipeline. The vision was a kind of combinatorial image factory — you pick your kernel, you pick your desktop, you get an image. The ambition outpaced the execution. The organisation has fifteen repos, a real domain name, and an installer backend. Whether it ever ships to a real user is genuinely unclear.

**Bluefin LTS / [ublue-os/bluefin-lts](https://github.com/ublue-os/bluefin-lts)** — Nineteen merged pull requests backporting GNOME 50 to Enterprise Linux 10. This is the one on this list that actually got used by real people. The promise: you get a modern GNOME desktop with modern apps, running on a boring, stable, ten-year-support Enterprise Linux base. Fixed GDM boot failures. Fixed SELinux policy. Sorted out kernel variants. Ported the artwork pipeline. This one has users. This one matters.

**[bluefin-cli](https://github.com/hanthor/bluefin-cli)** — A cross-platform TUI for setting up your terminal environment: colour themes, fonts, Nerd Font icons, the rewritten-in-Rust alternatives to standard Unix tools (eza instead of ls, bat instead of cat, that whole ecosystem). Runs on Linux, macOS, and Windows via PowerShell. The Windows build went from a 2900ms profile load time to 140ms after a full refactor. Ships via GoReleaser with automated Homebrew bottles and winget manifests. I built it hoping it would be a gateway drug — someone would install it on Windows, get a taste of what a properly configured terminal feels like, and wonder what else was possible. Maybe they would try Linux. It is a theory.

## The Honest Bit

The combined codebase across these projects is tens of thousands of lines of code. Most of it runs on nobody's machine — including mine.

I built these things, pushed them, and moved on to the next idea within days. The Flatpak is unsigned. Pasar has no users. Lima-container has no issues filed. Zerobrew might be abandoned upstream. The image matrix is aspirational.

The deeper irony: the reason nobody is filing issues or starring these repos is not that they have not found them. It is that they are busy. Busy building their own solutions to the same problems, with their own LLM, in their own afternoon session. Why install someone else's half-finished Homebrew GUI when you can vibe-code your own in two hours?

What does that do to open source? The whole model is built on the idea that people share solutions because building them is hard. If building is cheap, does sharing still happen? Or do we end up with a million single-developer solutions to the same problem that never meet?

I do not have an answer to this. I am not sure anyone does yet.

## The Finale

One afternoon I let Claude Opus open an upstream bug report without reading it carefully first. The report was about `systemd-repart` not creating partition block devices for loop devices — a real bug, a real problem I had actually hit while building the installer backend for TunaOS.

The model opened it in `systemd/systemd` itself.

That is the project maintained by Lennart Poettering. One of the most consequential and most argued-about figures in the history of Linux. A person who does not need random half-finished-project people filing issues on his tracker on a Tuesday afternoon.

He replied. The issue is [systemd/systemd#41385](https://github.com/systemd/systemd/issues/41385).

I had become an accidental nuisance to one of the most important projects in all of open source — not through malice, just through not paying attention while the model ran.

I am not sure if this is funny or a warning. Probably both.

## So

It is very early days. Nobody knows how this turns out — not the researchers, not the maintainers, not the companies giving away tokens for free. The only honest thing to say is that it has changed what one person can do in an afternoon, and we are still figuring out whether that is good.

Thank you for coming to my talk.