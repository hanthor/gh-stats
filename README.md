# @hanthor

a field report

---

Growing up, my bedroom was full of half-disassembled electronics. Things that worked fine until I decided to see what was inside, and then worked less fine, and then became a pile of parts I never quite put back together. 

Now my Github is becoming something very similar. 

I am not an artist. I hate making things from scratch, I was terrible at writing papers in school. Much better and refining somone else's work than creating my own 😁

This carried over into code. I never took a computer science course. My areas of study were in economics and agricultural business. I got into computers through sysadmin work — my job was making other people's software run, not writing my own. I got good at reading documentation, tracing errors, and understanding systems well enough to keep them running. I wrote scripts. I occasionally filed minor fix PRs on large codebases. But building something from a blank file was not really in my repertoire.

LLMs changed that. Not by making me smarter or more creative — but by eliminating the blank canvas entirely. I describe something I want and it generates something 80% of they way there. It used to be, like a year ago, that I would then go line by line and essentially rewrite it how I want it. But with these IDE and CLI tools the temptation has been irresistible to just put it in automatic mode and accept whatever it does out. I'm now often working on 6 "projects" at the same time. I can see why people are saying coding is dead or that CEOs are wanting to layoff employees. But my projects aren't for my job and I would not be proud to be submit PRs like this if I was getting paid for it. 

This is not a success story. It is a field report from someone who has shipped more code in six months than the rest of their life combined, and is still figuring out what the point of all this is. 

## The Tour

**[Pasar](https://github.com/hanthor/Pasar)** — I wanted a proper GUI for Homebrew on Linux. Not a terminal. An actual app, with icons, with a list I could scroll through, with Brewfile support so I could see what I had installed. I found an existing macOS Homebrew GUI WailBrew, added Linux support, but I thought it looked ugly on Linux so I kept going. I took and exisitj g Flatpak App store on Linux called Bazaar and told the LLM to rip it off but make it for homebrew. It now "works" but has hundreds of papercuts, little UI thing that are wrong. I do not use it. I use the terminal.

**[zerobrew](https://github.com/hanthor/zerobrew)** — Someone rewrote Homebrew in Rust. Supposedly 5–20x faster, drop-in replacement. I thought it was a good idea and spent an afternoon adding Linux support and tap/formula parsing so it could find packages beyond the default Homebrew core. Filed the PR upstream. It got merged. I realized the hype was just hype. and went back to homebrew. I scratched the itch and left.

**[rancher-desktop-flatpak](https://github.com/hanthor/rancher-desktop-flatpak)** — Rancher Desktop is a full Kubernetes-plus-container-runtime desktop application. On Linux, it wants to install as an AppImage, which I hate. I packaged it as a Flatpak — sandboxed, self-contained, installs without fighting the system. The Flatpak is unsigned, because getting into the official Flathub review queue is a whole thing I have not done. Nobody has opened an issue.

**[lima-container](https://github.com/hanthor/lima-container)** — The idea: run a full VM hypervisor and GUI inside a Podman container, accessible through your browser via noVNC. You spin up the container, open localhost:8006, and you have a dashboard for managing VMs. No KVM driver installed on the host, no libvirt, nothing. The container handles it. There are three image variants: plain, web dashboard, and one that builds VMs directly from bootc container image URIs. It works, mostly, but I'm still not really using it. 

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