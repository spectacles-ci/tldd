# Looker Extension app

app is a Looker extension using React and TypeScript.

## Getting Started for Development

1. Install the dependencies with [Yarn](https://yarnpkg.com/).

    ```sh
    yarn install
    ```

2. Build the project

    ```sh
    yarn build
    ```

3. Start the development server

    ```sh
    yarn dev
    ```

    The development server is now running and serving the JavaScript at https://localhost:8080/bundle.js.

4. Navigate to: https://spectacles.looker.com/extensions/tldd::tldd

## Deploying the extension

To allow other people to use the extension, build the JavaScript bundle file and directly include it in the project.

1. Build the extension with `yarn build` in the extension project directory on your development machine.
2. Drag and drop the generated `dist/bundle.js` file into the Looker project interface
3. Modify your `manifest.lkml` to use `file` instead of `url`:

   ```
    project_name: "app"
    application: app {
        label: "A Looker React/TypeScript extension"
        file: "bundle.js"
        entitlements: {
          core_api_methods: ["me"]
        }
    }
   ```
