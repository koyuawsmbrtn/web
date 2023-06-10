---
title: Fixing Overwatch 2 crashing and lagging on Linux
layout: ../../layouts/page.astro
description: Yes, Overwatch on Linux is broken once again. This time it lags and crashes on a few systems, especially those who have a Nvidia GPU which is still a fair share of Linux users.
hot: false
---

Yes, Overwatch on Linux is broken once again. This time it lags and crashes on a few systems, especially those who have a Nvidia GPU which is still a fair share of Linux users.

First we want to fix the overall lagginess when compiling shaders. Make sure you have enough disk space to store GL shaders and go to your game options in Lutris and enable the advanced options. Then go to "system settings" and under "environment variables" add the environment variable `__GL_SHADER_DISK_CACHE_SKIP_CLEANUP` with the value `1`. This keeps the compiled GL shader cache after each game launch.

According to [this Reddit post](https://redd.it/y0xiub) you also have to download a tar archive from [here](https://github.com/bottlesdevs/wine/releases/tag/caffe-7.18) and extract it to `~/.local/share/lutris/runners/wine/`. If you've done that restart Lutris and change your Wine version to `caffe-7.18` in the game's runner options. This one seems to have fixed the crashes on my end.

This [Blizzard forum post](https://us.forums.blizzard.com/en/overwatch/t/ow2-crashing-alternative-fix-ow2-on-linux-guide-video/712853) also explains the fix with `__GL_SHADER_DISK_CACHE_SKIP_CLEANUP` and also mentions putting `--tank_WorkerThreadCount 4` in the Battle.net game launcher options (not the Lutris options). This should also improve performance in the game.

I hope I could give some directions and hope you have fun with Overwatch 2 now running on your Linux gaming rig. See you on the finish line, Linux heroes!