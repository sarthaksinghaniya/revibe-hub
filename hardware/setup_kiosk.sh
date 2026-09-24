#!/usr/bin/env bash
# ==============================================================================
# W2W Smart Kiosk Setup & Autostart Installer (Raspberry Pi OS)
# ==============================================================================

set -e

echo "🚀 Installing W2W Smart AI Waste Kiosk dependencies..."

# 1. System Dependencies
sudo apt-get update
sudo apt-get install -y \
  python3-pip \
  python3-opencv \
  chromium-browser \
  x11-xserver-utils \
  unclutter \
  git

# 2. Python Packages
pip3 install requests --break-system-packages || pip3 install requests

# 3. Create Hardware Directory & Copy Service
mkdir -p /home/pi/hardware
cp w2w_kiosk.py /home/pi/hardware/w2w_kiosk.py
chmod +x /home/pi/hardware/w2w_kiosk.py

# 4. Systemd Service Setup
echo "⚙️ Configuring systemd kiosk daemon..."
sudo cp w2w-kiosk.service /etc/systemd/system/w2w-kiosk.service
sudo systemctl daemon-reload
sudo systemctl enable w2w-kiosk.service
sudo systemctl restart w2w-kiosk.service

# 5. Chromium Fullscreen Kiosk Mode Setup (LXDE Autostart)
AUTOSTART_FILE="/home/pi/.config/lxsession/LXDE-pi/autostart"
mkdir -p "$(dirname "$AUTOSTART_FILE")"

cat << 'EOF' > "$AUTOSTART_FILE"
@xset s off
@xset -dpms
@xset s noblank
@unclutter -idle 0.1 -root
@chromium-browser --kiosk --noerrdialogs --disable-infobars --check-for-update-interval=31536000 http://localhost:8080
EOF

echo "✅ W2W Smart Kiosk installation complete!"
echo "📍 Restart your Raspberry Pi to launch full kiosk mode: sudo reboot"
