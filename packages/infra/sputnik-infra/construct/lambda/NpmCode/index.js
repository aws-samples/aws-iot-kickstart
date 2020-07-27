"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const ini_1 = require("ini");
const child_process_1 = require("child_process");
const aws_lambda_1 = require("@aws-cdk/aws-lambda");
const assets_1 = require("@aws-cdk/assets");
const fs_1 = require("@aws-cdk/core/lib/fs");
const core_1 = require("@aws-cdk/core");
const shorthash_1 = require("shorthash");
const cdk_identity_utils_1 = require("../../../utils/cdk-identity-utils");
const aws_s3_1 = require("@aws-cdk/aws-s3");
const TRUE = /(true|1)/i;
const ASSET_ROOT = process.env.CDK_OUTDIR;
const VERBOSE = TRUE.test(String(process.env.CDK_NPMCODE_VERBOSE));
const STDOUT = VERBOSE ? 'inherit' : 'ignore';
class NpmCode extends core_1.Construct {
    constructor(scope, id, props) {
        super(scope, id);
        const { path: sourcePath, artifact, ...options } = props;
        this.path = sourcePath;
        this.cmd = props.cmd || 'npm install --production';
        const assetPath = artifact ? path.join(sourcePath, artifact) : sourcePath;
        this._sourceHash = fs_1.FileSystem.fingerprint(assetPath, { follow: fs_1.SymlinkFollowMode.ALWAYS });
        const outDir = path.join(ASSET_ROOT, `asset.${this._sourceHash}`);
        try {
            fs.lstatSync(outDir).isDirectory();
            VERBOSE && console.log('NpmCode: asset already cached for hash:', sourcePath, outDir);
        }
        catch (error) {
            this.runCmd();
        }
        this.assetCode = aws_lambda_1.Code.fromAsset(assetPath, { follow: assets_1.FollowMode.ALWAYS, ...options });
    }
    static fromNpmPackageDir(scope, sourcePath, options) {
        if (!path.isAbsolute(sourcePath)) {
            throw new Error(`NpmCode only support absolute paths: ${sourcePath}`);
        }
        const id = `NpmCode-${shorthash_1.unique(sourcePath)}`;
        const rootStack = cdk_identity_utils_1.getRootStack(scope);
        let npmCode = rootStack.node.tryFindChild(id);
        if (npmCode == null) {
            npmCode = new NpmCode(rootStack, id, { ...options, path: sourcePath });
        }
        scope.node.addDependency(npmCode);
        return npmCode;
    }
    bind(scope) {
        return this.assetCode.bind(scope);
    }
    bindToResource(resource, options = {}) {
        return this.assetCode.bindToResource(resource, options);
    }
    asSource() {
        const bind = (scope) => {
            var _a, _b;
            const codeConfig = this.bind(scope);
            const bucketName = (_a = codeConfig.s3Location) === null || _a === void 0 ? void 0 : _a.bucketName;
            const objectKey = (_b = codeConfig.s3Location) === null || _b === void 0 ? void 0 : _b.objectKey;
            return {
                bucket: aws_s3_1.Bucket.fromBucketName(scope, `Source_${this.path}`, bucketName),
                zipObjectKey: objectKey,
            };
        };
        return {
            bind,
        };
    }
    runCmd() {
        const dir = this.path;
        if (!fs.lstatSync(path.join(dir, 'package.json')).isFile()) {
            throw new Error(`NpmCode path must be a directory with package.json file: ${dir}/package.json is missing!`);
        }
        const env = {
            ...process.env,
            npm_config_production: 'true',
            npm_config_fund: 'false',
            npm_config_audit: VERBOSE ? 'true' : 'false',
        };
        try {
            const npmrc = ini_1.parse(fs.readFileSync(path.join(dir, '.npmrc'), 'utf-8'));
            Object.entries(npmrc).forEach(([key, value]) => {
                switch (key) {
                    case 'package-lock':
                        env.npm_config_package_lock = String(value);
                        break;
                    default:
                        console.warn('NpmCode: ignoring unsupported .npmrc config:', key, value);
                        break;
                }
            });
        }
        catch (error) {
        }
        const packageJson = JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), 'utf-8'));
        console.log(`NpmCode: running "${this.cmd}" for code asset:`, dir);
        child_process_1.execSync(this.cmd, { env, cwd: dir, stdio: [STDOUT, STDOUT, 'inherit'] });
        if (Object.keys(packageJson.dependencies || {}).length !== 0 && !fs.lstatSync(path.join(dir, 'node_modules')).isDirectory()) {
            console.warn('NpmCode: package.json:', dir, packageJson);
            throw new Error(`NpmCode failed to create node_modules directory for "${dir}"`);
        }
        if (VERBOSE) {
            child_process_1.execSync('tree --link -a -l 2', { cwd: dir, stdio: 'inherit' });
        }
        console.log('NpmCode: successfully installed package:', dir);
    }
}
exports.NpmCode = NpmCode;
//# sourceMappingURL=index.js.map