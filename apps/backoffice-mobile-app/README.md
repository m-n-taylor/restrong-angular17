* Prepare code for Build (Due to limited time, i was not able to make this whole process more smooth, But you can improve it, if needed)

- Make Web App (Consumer + Restowner) build and make sure `dist` folder is present.
- Remove `www` folder from here.
- Run gulp copy
- Run gulp watch
- While `gulp watch` is running, Go in `dist` folder of Web App (Consumer + Restowner) and open `index.html`, add some text and remove it, the purpose is to press `ctrl + s` to `gulp watch` see that file, and creates file in `www/index.html` folder, because `gulp` does some changes in file. see `gulpfile.js` for more details. (You can improve this process, if needed)
- Make sure `www/config.json` has correct values, and also append those values in `www/config.js`
- Go in `www/main.xxxxxxxxxxxx.bundle.js` and replace text `/404` with `/`. (this is a workaround, you can improve it, if needed)
- Remove `videos` from `www/assets/videos` as they are not used in mobile app now

- Next create build like normally do in ionic...

* IOS Build
`ionic cordvoa build ios`

* Android Build
ionic cordova build --release android

jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore "../../../android-certificates/com.dishzilla.backoffice/app.keystore" -storepass "${keystoreJSON.password}" -keypass "${keystoreJSON.password}" "./platforms/android/build/outputs/apk/release/android-release-unsigned.apk" "${keystoreJSON.alias}"

zipalign -v 4 "./platforms/android/build/outputs/apk/release/android-release-unsigned.apk" "./platforms/android/build/outputs/apk/release/android-release-signed.apk"