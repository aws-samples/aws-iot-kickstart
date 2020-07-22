const { Select } = require('enquirer')
const { PackagePrompt } = require('@deathstar/tool-hygen')

module.exports = {
  params: async () => {

    const pacakgeDirPrompt = new Select({
      name: 'type',
      message: 'What type of package?',
      choices: [
        'core',
        'ui',
        'private',
      ],
    })

    const packageDir = await pacakgeDirPrompt.run()

    const packagePrompt = new PackagePrompt({
      packageDir,
      scope: '@deathstar',
      license: 'Apache-2.0',
      prefix: false,
      defaults: {
        version: '0.0.0-alpha.0',
        homepage: 'https://github.com/aws-samples/aws-iot-kickstart',
        repository: 'https://github.com/aws-samples/aws-iot-kickstart',
      }
    })

    const packageValues = await packagePrompt.run()

    console.log('packageValues:', packageValues)

    return packageValues
  }
}
