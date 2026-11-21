import { type PropsWithChildren } from 'react';
import { ScrollViewStyleReset, useServerDocumentContext } from 'expo-router/html';
import { APP_META } from '@/content/app';

const SW_REGISTRATION = "if('serviceWorker' in navigator){window.addEventListener('load',function(){navigator.serviceWorker.register('/sw.js').catch(function(){});});}";

const WEB_FONTS = [
  ['Fraunces_400Regular', 'Fraunces_400Regular.ttf'],
  ['Fraunces_400Regular_Italic', 'Fraunces_400Regular_Italic.ttf'],
  ['Fraunces_700Bold', 'Fraunces_700Bold.ttf'],
  ['Literata_400Regular', 'Literata_400Regular.ttf'],
  ['Literata_400Regular_Italic', 'Literata_400Regular_Italic.ttf'],
  ['Literata_600SemiBold', 'Literata_600SemiBold.ttf'],
  ['Inter_400Regular', 'Inter_400Regular.ttf'],
  ['Inter_500Medium', 'Inter_500Medium.ttf'],
  ['Inter_600SemiBold', 'Inter_600SemiBold.ttf'],
  ['Inter_700Bold', 'Inter_700Bold.ttf'],
  ['feather', 'Feather.ttf'],
].map(([family, file]) => `@font-face{font-family:"${family}";src:url("/fonts/${file}") format("truetype");font-display:swap;}`).join('');

export default function Root({ children }: PropsWithChildren) {
  const { headNodes, bodyNodes, htmlAttributes, bodyAttributes } = useServerDocumentContext();

  return (
    <html {...htmlAttributes} lang={APP_META.lang}>
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <meta name="description" content={APP_META.description} />
        <meta name="theme-color" content={APP_META.themeColor} />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content={APP_META.name} />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.webmanifest" />
        <link rel="preload" href="/fonts/Feather.ttf" as="font" type="font/ttf" crossOrigin="anonymous" />
        <style id="expo-generated-fonts" dangerouslySetInnerHTML={{ __html: WEB_FONTS }} />
        <ScrollViewStyleReset />
        {headNodes}
      </head>
      <body {...bodyAttributes}>
        {children}
        {bodyNodes}
        <script dangerouslySetInnerHTML={{ __html: SW_REGISTRATION }} />
      </body>
    </html>
  );
}
