"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.s3Config = exports.config = void 0;
//Change to read from ENV
exports.config = {
    apiVersion: '2006-03-01',
    region: 'us-west-2'
};
exports.s3Config = {
    bucket: 'videos'
};
