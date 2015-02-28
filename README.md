# LTI-Tester
A tool to help test LTI integration with Foliotek or other LTI compatible sites.

## To Deploy
`grunt prod`
make sure site works at this point
```
cd dist/
git init
git add .
git commit -m "Deploy to Github Pages"
git push --force "https://github.com/foliotek/LTI-Tester" master:gh-pages
```