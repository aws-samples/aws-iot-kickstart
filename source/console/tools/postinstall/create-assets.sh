#!/bin/bash

echo "Creating assets..."
mkdir -p src/assets/ui-js
echo " - underscore.js"
cp node_modules/underscore/underscore-min.js src/assets/ui-js/underscore.min.js
echo " - jquery.js"
cp node_modules/jquery/dist/jquery.min.js src/assets/ui-js/jquery.min.js
echo " - jquery.slimscroll.js"
cp node_modules/jquery-slimscroll/jquery.slimscroll.min.js src/assets/ui-js/jquery.slimscroll.min.js
echo " - jquery.blockUI.js"
cp node_modules/jquery-blockui/jquery.blockUI.js  src/assets/ui-js/jquery.blockUI.js
echo " - popper.js"
cp node_modules/popper.js/dist/umd/popper.min.js src/assets/ui-js/popper.min.js
echo " - bootstrap.js"
cp node_modules/bootstrap/dist/js/bootstrap.min.js src/assets/ui-js/bootstrap.min.js
echo " - bootstrap.css"
cp node_modules/bootstrap/dist/css/bootstrap.min.css src/assets/css/bootstrap.min.css
echo " - jquery.slimscroll.js"
cp node_modules/jquery-slimscroll/jquery.slimscroll.min.js src/assets/ui-js/jquery.slimscroll.min.js
echo " - waves.js"
cp node_modules/node-waves/dist/waves.min.js src/assets/ui-js/waves.min.js
echo " - sticky-kit.js"
cp node_modules/sticky-kit/dist/sticky-kit.min.js src/assets/ui-js/sticky-kit.min.js
echo " - gauge.js"
cp node_modules/gauge.js/dist/gauge.min.js src/assets/ui-js/gauge.min.js
echo " - chart.js"
cp node_modules/chart.js/dist/Chart.min.js src/assets/ui-js/Chart.min.js
echo " - chartjs-plugin-annotation.js"
cp node_modules/chartjs-plugin-annotation/chartjs-plugin-annotation.min.js src/assets/ui-js/chartjs-plugin-annotation.min.js
echo " - chartjs-plugin-draggable.js"
cp node_modules/chartjs-plugin-draggable/dist/chartjs-plugin-draggable.min.js src/assets/ui-js/chartjs-plugin-draggable.min.js
echo " - owl.carousel.js"
cp node_modules/owl.carousel/dist/owl.carousel.min.js src/assets/ui-js/owl.carousel.min.js
echo " - owl.carousel.css"
cp node_modules/owl.carousel/dist/assets/owl.carousel.min.css src/assets/css/owl.carousel.min.css
echo " - font-awesome.css"
cp node_modules/font-awesome/css/font-awesome.min.css src/assets/css/font-awesome.min.css
cp -R node_modules/font-awesome/fonts src/assets/fonts
