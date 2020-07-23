const { Select } = require('enquirer')
const { PackagePrompt } = require('@deathstar/tool-hygen')

module.exports = {
  params: async () => {

    const typePrompt = new Select({
      name: 'type',
      message: 'What type of package?',
      choices: [
        'default',
        'flat',
      ],
    })

    const type = await typePrompt.run()

    const packageDirPrompt = new Select({
      name: 'dir',
      message: 'What type of package?',
      choices: [
        'core',
        'infra',
        'api',
        'ui',
        'private',
      ],
    })

    const packageDir = await packageDirPrompt.run()

    const isPrivate = packageDir === 'private'
    let prefix = `sputnik-${packageDir}`

    if (isPrivate) {
      prefix = false
    }

    const packagePrompt = new PackagePrompt({
      packageDir,
      scope: '@deathstar',
      license: 'Apache-2.0',
      prefix,
      private: isPrivate,
      defaults: {
        version: '0.0.0-alpha.0',
        homepage: 'https://github.com/aws-samples/aws-iot-kickstart',
        repository: 'https://github.com/aws-samples/aws-iot-kickstart',
      }
    })

    const packageValues = await packagePrompt.run()

    return Object.assign(packageValues, {
      type: type === 'default' ? 'nested' : type,
    })
  }
}
