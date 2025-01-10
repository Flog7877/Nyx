set -e

function confirm_continue() {
    read -p "Alle Änderungen gepusht? (Y/N): " choice
    case "$choice" in
        y|Y ) echo "Fortfahren...";;
        n|N ) echo "Abgebrochen."; exit 1;;
        * ) echo "Ungültige Eingabe. Bitte y oder n eingeben."; confirm_continue;;
    esac
}

confirm_continue

echo "Frontend wird gebaut..."
cd /var/www/flo-g.de/Nyx/frontend/
npm install
npm run build

echo "Backend wird aktualisiert..."
cd /var/www/flo-g.de/Nyx/backend/
npm install
pm2 reload /var/www/flo-g.de/Nyx/backend/ecosystem.config.js --env production

echo "Deployment abgeschlossen!"
