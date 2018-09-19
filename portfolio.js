'use strict'

const path = require('path')
const tar = require('tar')

const dataPath = 'static/data'
const portfolios = [
  { tarname: 'tower.tgz', source: 'tower' },
  { tarname: 'domainvault.tgz', source: 'domainvault' },
  { tarname: 'dreamworx.tgz', source: 'dreamworx' },
  { tarname: 'newcasinos.tgz', source: 'newcasinos' },
  { tarname: 'horizon.tgz', source: 'horizon' }
]

const status = (function status () {
  let _intervalId = null

  return {
    start: function () {
      process.stdout.write('.')
      if (process.stdout.isTTY) {
        _intervalId = _intervalId || setInterval(function () {
          process.stdout.write('.')
        }, 1000)
      }
    },
    stop: function () {
      if (process.stdout.isTTY && _intervalId) {
        clearInterval(_intervalId)
        _intervalId = null
        process.stdout.write('\n')
      }
    }
  }
})()

function iterateOverSeries (list, iteratee, callback) {
  callback = callback || function () {}
  let index = 0
  let length = list.length

  if (length === 0) {
    callback(null)
  }

  function iterateeCallback (err) {
    if (err) {
      callback(err)
    } else if (++index === length) {
      callback(null)
    } else {
      iteratee(list[index], iterateeCallback)
    }
  }

  iteratee(list[0], iterateeCallback)
}

function portfolioTar () {
  iterateOverSeries(portfolios, function (portfolio, cb) {
    console.log('process portfolio: %j', portfolio)
    status.start()
    tar.c({
      gzip: { level: 9 },
      file: portfolio.tarname,
      onwarn: function onWarn (message, data) {
        console.warn(`message: ${message}, data:\n`, data)
      }
    }, [portfolio.source], function (err) {
      status.stop()
      if (err) {
        return cb(err)
      }
      console.log('tar %s created', portfolio.tarname)
      cb(null)
    })
  }, function (err) {
    if (err) {
      return console.error(err)
    }
  })
}

function portfolioUntar () {
  iterateOverSeries(portfolios, function (portfolio, cb) {
    console.log('process portfolio: %j', portfolio)
    status.start()
    tar.x({
      file: path.resolve(path.join(dataPath, portfolio.tarname)),
      cwd: dataPath,
      onwarn: function onWarn (message, data) {
        console.warn(`message: ${message}, data:\n`, data)
      }
    }, function (err) {
      status.stop()
      if (err) {
        return cb(err)
      }
      console.log('untar %s done', portfolio.tarname)
      cb(null)
    })
  }, function (err) {
    if (err) {
      return console.error(err)
    }
  })
}

const args = process.argv.slice(2)

if (args.length === 0 || args[0] === '-h' || args[0] === '--help') {
  console.log('Usage: portfolio.js [options]')
  console.log()
  console.log('Un/compress the portfolios (tower, domainvault, ...)')
  console.log()
  console.log('Options:')
  console.log()
  console.log('-h, --help  output the usage information')
  console.log('--tar       compress the portfolios')
  console.log('--untar     uncompress the portfolios. NOTE: the file will be overwritten')
  process.exit(0)
}

switch (args[0]) {
  case '--tar':
    console.log('tar portfolio relative to %s', dataPath)
    process.chdir(dataPath)
    portfolioTar()
    break

  case '--untar':
    console.log('untar portfolio relative to %s', dataPath)
    portfolioUntar()
    break
}
