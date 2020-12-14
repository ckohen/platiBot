'use strict';

const request = require('../events/request');

const requests = {};

requests.streamStart = require('./streamStart');
requests.streamStop = require('./streamStop');

module.exports = requests;
