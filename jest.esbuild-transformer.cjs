const esbuild = require('esbuild');

module.exports = {
  process(sourceText, sourcePath) {
    if (!sourcePath.endsWith('.ts')) {
      return { code: sourceText };
    }

    const result = esbuild.transformSync(sourceText, {
      format: 'cjs',
      loader: 'ts',
      sourcefile: sourcePath,
      sourcemap: 'inline',
      target: 'es2020',
    });

    return { code: result.code };
  },
};
