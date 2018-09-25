var fs      = require('fs');
var path    = require('path');
var pejs    = require('pejs');
var mkdirp  = require('mkdirp');
var utils   = require('../src/utils');

var rootDir   = path.normalize(path.join(__dirname, ".."));
var viewsDir  = path.join(rootDir, 'dapp/views');
var publicDir = path.join(rootDir, 'public');

var views = pejs({
    basedir: viewsDir,
    watch:   false,
});

function compilePage(pathFragment, template, data) {
    var publicPath = path.join(publicDir, pathFragment);
    console.info(`Rendering template '${template}' to ${publicPath}`);
    mkdirp.sync(path.dirname(publicPath), {mode: 0755});
    views.render(template, (data || {}), function(err, result) {
	if (err) {
	    console.error(err);
	} else {
	    fs.writeFileSync(publicPath, result);
	}
    });
}

compilePage("/index.html",       "help", {
    base_dir: ".",
    contract_src: fs.readFileSync(path.join(rootDir, 'contracts/MultiSig2of3.sol'))
});
compilePage("/error.html",       "error",  {base_dir: "."});
compilePage("/spend/index.html", "spend",  {base_dir: ".."});
compilePage("/publish/index.html", "publish",  {base_dir: ".."});
