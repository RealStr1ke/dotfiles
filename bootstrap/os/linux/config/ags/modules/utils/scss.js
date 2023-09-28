const { exec, ensureDirectory } = ags.Utils;

export default () => {
    try {
        const tmp = "/tmp/ags/scss";
        ensureDirectory(tmp);

        exec(`sassc ${ags.App.configDir}/assets/styles/main.scss ${tmp}/main.css`);
        ags.App.resetCss();
        ags.App.applyCss(`${tmp}/main.css`);
    } catch (error) {
        console.error(error);
    }
};