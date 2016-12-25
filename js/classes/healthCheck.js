/************************************************************************
 Product    : Home information and control
 Date       : 2016-12-12
 Copyright  : Copyright (C) 2016 Kjeholt Engineering. All rights reserved.
 Contact    : dev@kjeholt.se
 Url        : http://www-dev.kjeholt.se
 Licence    : ---
 ---------------------------------------------------------
 File       : mqtt-agent-onewire/js/classes/healtCheck.js
 Version    : 0.1.0
 Author     : Bjorn Kjeholt
 *************************************************************************/

var healthCheckWeb = require('http');

var healtCheck = function (configInfo) {
    var self = this;
    this.ci = configInfo;
    
};

exports.create_healthCheck = function(ci){
    return new healthCheck(ci);
};
