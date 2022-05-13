import cheerio from 'cheerio';
import glob from 'glob-promise';
import path from 'path';
import { promises as fs } from 'fs';
import camelcase from 'camelcase';
import rimraf from 'rimraf';

const rootDir = path.resolve(__dirname, '..');
const iconsDir = path.resolve(rootDir, 'icons');
const DIST = path.resolve(rootDir, '.', 'src', 'lib');

interface Content {
  files: string;
  formatter: (name: string) => string;
}

interface Icon {
  id: string;
  name: string;
  contents: Content[];
}

const icons: Icon[] = [
  {
    id: 'fa',
    name: 'Font Awesome',
    contents: [
      {
        files: path.resolve(iconsDir, 'fontawesome/svgs/+(brands|solid)/*.svg'),
        formatter: (name) => `Fa${name}`,
      },
      {
        files: path.resolve(iconsDir, 'fontawesome/svgs/regular/*.svg'),
        formatter: (name) => `FaReg${name}`,
      },
    ],
  },
  {
    id: 'io',
    name: 'Ionicons',
    contents: [
      {
        files: path.resolve(rootDir, 'node_modules/ionicons/dist/collection/icon/svg/*.svg'),
        formatter: (name) => `Io${name}`,
      },
    ],
  },
  {
    id: 'md',
    name: 'Material Design icons',
    contents: [
      {
        files: path.resolve(iconsDir, 'material-design-icons/*/svg/production/*_24px.svg'),
        formatter: (name) => name.replace(/Ic(\w+)24px/i, 'Md$1'),
      },
    ],
  },
  {
    id: 'ti',
    name: 'Typicons',
    contents: [
      {
        files: path.resolve(iconsDir, 'typicons/src/svg/*.svg'),
        formatter: (name) => `Ti${name}`,
      },
    ],
  },
  {
    id: 'go',
    name: 'Github Octicons icons',
    contents: [
      {
        files: path.resolve(rootDir, 'node_modules/octicons/build/svg/*.svg'),
        formatter: (name) => `Go${name}`,
      },
    ],
  },
  /*
  {
    id: 'fi',
    name: 'Feather',
    contents: [
      {
        files: path.resolve(
          rootDir,
          'node_modules/feather-icons/dist/icons/*.svg'
        ),
        formatter: name => `Fi${name}`,
      },
    ],
  },
  */
  {
    id: 'gi',
    name: 'Game Icons',
    contents: [
      {
        files: path.resolve(
          iconsDir,
          'game-icons-inverted/+(carl-olsen|andymeneely|cathelineau|darkzaitzev|delapouite|faithtoken|generalace135|guard13007|heavenly-dog|irongamer|john-colburn|kier-heyl|lorc|lord-berandas|quoting|rihlsul|sbed|skoll|sparker|spencerdub|zajkonur)/originals/svg/000000/transparent/*.svg'
        ),
        formatter: (name) => `Gi${name}`,
      },
      {
        files: path.resolve(
          iconsDir,
          'game-icons-inverted/+(zeromancer|willdabeast|)/deviations/svg/000000/transparent/*.svg'
        ),
        formatter: (name) => `Gi${name}`,
      },
      {
        files: path.resolve(iconsDir, 'game-icons-inverted/+(john-redman)/hands/svg/000000/transparent/*.svg'),
        formatter: (name) => `Gi${name}`,
      },
      {
        files: path.resolve(iconsDir, 'game-icons-inverted/+(lucasms)/equipment/svg/000000/transparent/*.svg'),
        formatter: (name) => `Gi${name}`,
      },
      {
        files: path.resolve(iconsDir, 'game-icons-inverted/+(priorblue)/batteries/svg/000000/transparent/*.svg'),
        formatter: (name) => `Gi${name}`,
      },
      {
        files: path.resolve(iconsDir, 'game-icons-inverted/+(viscious-speed)/abstract/svg/000000/transparent/*.svg'),
        formatter: (name) => `Gi${name}`,
      },
      {
        files: path.resolve(
          iconsDir,
          'game-icons-inverted/+(various-artists)/public-domain/svg/000000/transparent/*.svg'
        ),
        formatter: (name) => `Gi${name}`,
      },
      {
        files: path.resolve(iconsDir, 'game-icons-inverted/+(felbrigg)/arrows/svg/000000/transparent/*.svg'),
        formatter: (name) => `Gi${name}`,
      },
      {
        files: path.resolve(iconsDir, 'game-icons-inverted/aussiesim/*.svg'),
        formatter: (name) => `Gi${name}`,
      },
    ],
  },
  {
    id: 'wi',
    name: 'Weather Icons',
    contents: [
      {
        files: path.resolve(iconsDir, 'weather-icons/svg/*.svg'),
        formatter: (name) => name,
      },
    ],
  },
  {
    id: 'di',
    name: 'Devicons',
    contents: [
      {
        files: path.resolve(iconsDir, 'devicons/!SVG/*.svg'),
        formatter: (name) => `Di${name}`,
      },
    ],
  },
  {
    id: 'hi',
    name: 'Heroicons',
    contents: [
      {
        files: path.resolve(iconsDir, 'heroicons/src/solid/*.svg'),
        formatter: (name) => `Hi${name}Solid`,
      },
      {
        files: path.resolve(iconsDir, 'heroicons/src/outline/*.svg'),
        formatter: (name) => `Hi${name}Outline`,
      },
    ],
  },
];

const mkdir = (dir: string) => {
  const exists = fs
    .access(dir)
    .then(() => true)
    .catch(() => false);
  if (exists) {
    rimraf.sync(dir);
  }
  return fs.mkdir(dir);
};

const write = (filePath: string[], content: string) => fs.writeFile(path.resolve(DIST, ...filePath), content, 'utf8');

const getIconFiles = async (content: Content) => glob(content.files);

interface Element {
  tag: string;
  attr: {
    fill: any;
    viewBox: string;
    d: string;
  };
  child: Element[];
}

async function convertIconData(svg: string) {
  const $svg = cheerio.load(svg, { xmlMode: true })('svg');

  const elementToTree: any = (element: any) =>
    element
      .filter((_: any, e: any) => !!e.tagName && !['style'].includes(e.tagName))
      .map((_: any, e: any) => ({
        tag: e.tagName,
        attr: e.attribs,
        child: e.children && e.children.length ? elementToTree(cheerio(e.children)) : undefined,
      }))
      .get();

  const tree = elementToTree($svg);
  return tree[0] as Element;
}

async function dirInit() {
  for (const icon of icons) {
    await mkdir(path.resolve(DIST, icon.id));
    await write([icon.id, 'index.ts'], '// THIS FILE IS AUTO GENERATED\n');
  }
}

async function writeIconModule(icon: Icon) {
  const filenames = new Set(); // for remove duplicate
  const filepaths = new Set();
  for (const content of icon.contents) {
    const files = await getIconFiles(content);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const svgStr = await fs.readFile(file, 'utf8');
      const iconData = await convertIconData(svgStr);

      const rawName = path.basename(file, path.extname(file));

      const pascalName = camelcase(rawName, { pascalCase: true });
      const name = (content.formatter && content.formatter(pascalName)) || pascalName;
      if (filenames.has(name) || filepaths.has(name)) continue;
      filenames.add(name);

      // write like: module/fa/index.esm.js
      await fs.appendFile(
        path.resolve(DIST, icon.id, 'index.ts'),
        `export { default as ${name} } from './${name}.svelte';\n`,
        'utf8'
      );

      const { attr, child } = iconData;
      const { viewBox } = attr;

      // convert camealcase to dash-case
      const attrStr = (attr: { [key: string]: string }) => {
        const str = Object.keys(attr)
          .filter((key) => key !== 'class')
          .map((key) => `${key}="${attr[key]}"`)
          .join(' ');
        return str;
      };

      const svgContent = child
        .map(({ attr }) => {
          return `<path ${attrStr(attr)} />`;
        })
        .join('\n');

      await write(
        [icon.id, `${name}.svelte`],
        `<script>
        import Icon from '../Icon.svelte';
        </script>
        <Icon ${attrStr(attr)} {...$$props}>
          ${svgContent}
        </Icon>
      `
      );

      filepaths.add(file);
    }
  }
}

async function main() {
  try {
    await dirInit();
    for (const icon of icons) {
      await writeIconModule(icon);
    }
    console.log('build completed successfully');
  } catch (e) {
    console.error(e);
  }
}

main();
