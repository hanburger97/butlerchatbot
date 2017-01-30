mongoexport --host ds149278.mlab.com --port 49278 --db heroku_sn31b5k0 -u=root -p=root --collection responses --jsonArray --out responses.json
mongoexport --host ds149278.mlab.com --port 49278 --db heroku_sn31b5k0 -u=root -p=root --collection rooms --jsonArray --out rooms.json
mongoexport --host ds149278.mlab.com --port 49278 --db heroku_sn31b5k0 -u=root -p=root --collection postbacks --jsonArray --out postbacks.json
