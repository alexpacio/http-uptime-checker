import { Service } from 'node-windows';

let svc = new Service({
    name: 'Http Uptime Checker',
    description: 'Checks if an HTTP service is up and fires an email alarm when down',
    script: 'C:\\http-uptime-checker\\dist\\index.js',
});

// Listen for the "install" event, which indicates the
// process is available as a service.
svc.on('install', function () {
    svc.start();
});

svc.on('alreadyinstalled', function () {
    svc.start();
});

svc.install();