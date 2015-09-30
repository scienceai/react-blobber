require('babel/register')({ stage: 0 });

/*
 * Universal constants
**/
global.__CLIENT__ = false;
global.__SERVER__ = true;
delete global.__BROWSER__;

if (process.env.NODE_ENV !== 'production') {
  if (!require('piping')({
    hook: true,
    ignore: /(\/\.|~$|\.json$)/i
  })) {
    return;
  }
}

require('./src/server');
