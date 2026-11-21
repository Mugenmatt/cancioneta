export interface RawCultural {
  text: string;
  author?: string;
  work?: string;
  year?: number;
  kind?: string;
  license?: 'original' | 'public_domain' | 'cc0' | 'cc_by' | 'cc_by_sa' | 'metadata_only' | 'permission';
  sourceUrl?: string;
  attribution?: string;
  externalLink?: string;
  tags?: string[];
  extra?: Record<string, string | number | boolean>;
}

const wiki = (q: string) => `https://es.wikipedia.org/w/index.php?search=${encodeURIComponent(q)}`;
const yt = (q: string) => `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`;

export const titles: RawCultural[] = [
  { text: 'Cien años de soledad', author: 'Gabriel García Márquez', kind: 'libro', year: 1967, license: 'metadata_only', externalLink: wiki('Cien años de soledad'), tags: ['familia', 'tiempo'] },
  { text: 'Rayuela', author: 'Julio Cortázar', kind: 'libro', year: 1963, license: 'metadata_only', externalLink: wiki('Rayuela novela'), tags: ['viaje', 'amor'] },
  { text: 'El sur', author: 'Jorge Luis Borges', kind: 'cuento', year: 1953, license: 'metadata_only', externalLink: wiki('El sur Borges'), tags: ['destino', 'sueño'] },
  { text: 'La invención de Morel', author: 'Adolfo Bioy Casares', kind: 'libro', year: 1940, license: 'metadata_only', externalLink: wiki('La invención de Morel'), tags: ['isla', 'memoria'] },
  { text: 'Pedro Páramo', author: 'Juan Rulfo', kind: 'libro', year: 1955, license: 'metadata_only', externalLink: wiki('Pedro Páramo'), tags: ['pueblo', 'muerte'] },
  { text: 'La casa de los espíritus', author: 'Isabel Allende', kind: 'libro', year: 1982, license: 'metadata_only', externalLink: wiki('La casa de los espíritus'), tags: ['familia', 'secreto'] },
  { text: 'El túnel', author: 'Ernesto Sabato', kind: 'libro', year: 1948, license: 'metadata_only', externalLink: wiki('El túnel Sabato'), tags: ['obsesión', 'soledad'] },
  { text: 'Sobre héroes y tumbas', author: 'Ernesto Sabato', kind: 'libro', year: 1961, license: 'metadata_only', externalLink: wiki('Sobre héroes y tumbas'), tags: ['historia', 'amor'] },
  { text: 'Ficciones', author: 'Jorge Luis Borges', kind: 'libro', year: 1944, license: 'metadata_only', externalLink: wiki('Ficciones'), tags: ['laberinto', 'infinito'] },
  { text: 'Bestiario', author: 'Julio Cortázar', kind: 'libro', year: 1951, license: 'metadata_only', externalLink: wiki('Bestiario Cortázar'), tags: ['casa', 'extrañeza'] },
  { text: 'El amor en los tiempos del cólera', author: 'Gabriel García Márquez', kind: 'libro', year: 1985, license: 'metadata_only', externalLink: wiki('El amor en los tiempos del cólera'), tags: ['espera', 'amor'] },
  { text: 'La metamorfosis', author: 'Franz Kafka', kind: 'libro', year: 1915, license: 'metadata_only', externalLink: wiki('La metamorfosis'), tags: ['cuerpo', 'familia'] },
  { text: 'El proceso', author: 'Franz Kafka', kind: 'libro', year: 1925, license: 'metadata_only', externalLink: wiki('El proceso Kafka'), tags: ['culpa', 'sistema'] },
  { text: 'Crimen y castigo', author: 'Fiódor Dostoievski', kind: 'libro', year: 1866, license: 'metadata_only', externalLink: wiki('Crimen y castigo'), tags: ['culpa', 'redención'] },
  { text: 'Orgullo y prejuicio', author: 'Jane Austen', kind: 'libro', year: 1813, license: 'metadata_only', externalLink: wiki('Orgullo y prejuicio'), tags: ['amor', 'clase'] },
  { text: 'Cumbres borrascosas', author: 'Emily Brontë', kind: 'libro', year: 1847, license: 'metadata_only', externalLink: wiki('Cumbres borrascosas'), tags: ['venganza', 'amor'] },
  { text: 'El gran Gatsby', author: 'F. Scott Fitzgerald', kind: 'libro', year: 1925, license: 'metadata_only', externalLink: wiki('El gran Gatsby'), tags: ['fiesta', 'pasado'] },
  { text: 'Madame Bovary', author: 'Gustave Flaubert', kind: 'libro', year: 1856, license: 'metadata_only', externalLink: wiki('Madame Bovary'), tags: ['deseo', 'rutina'] },
  { text: 'El extranjero', author: 'Albert Camus', kind: 'libro', year: 1942, license: 'metadata_only', externalLink: wiki('El extranjero Camus'), tags: ['ausencia', 'sol'] },
  { text: 'El secreto de sus ojos', author: 'Juan José Campanella', kind: 'película', year: 2009, license: 'metadata_only', externalLink: wiki('El secreto de sus ojos'), tags: ['memoria', 'justicia'] },
  { text: 'Relatos salvajes', author: 'Damián Szifron', kind: 'película', year: 2014, license: 'metadata_only', externalLink: wiki('Relatos salvajes'), tags: ['rabia', 'humor'] },
  { text: 'El hijo de la novia', author: 'Juan José Campanella', kind: 'película', year: 2001, license: 'metadata_only', externalLink: wiki('El hijo de la novia'), tags: ['familia', 'tiempo'] },
  { text: 'Esperando la carroza', author: 'Alejandro Doria', kind: 'película', year: 1985, license: 'metadata_only', externalLink: wiki('Esperando la carroza'), tags: ['familia', 'humor'] },
  { text: 'Historia de lo oculto', author: 'Cristian Ponce', kind: 'película', year: 2020, license: 'metadata_only', externalLink: wiki('Historia de lo oculto'), tags: ['misterio', 'medios'] },
  { text: 'Los simuladores', author: 'Damián Szifron', kind: 'serie', year: 2002, license: 'metadata_only', externalLink: wiki('Los simuladores'), tags: ['amistad', 'engaño'] },
  { text: 'Okupas', author: 'Bruno Stagnaro', kind: 'serie', year: 2000, license: 'metadata_only', externalLink: wiki('Okupas serie'), tags: ['casa', 'amistad'] },
  { text: 'El marginal', author: 'Sebastián Ortega', kind: 'serie', year: 2016, license: 'metadata_only', externalLink: wiki('El marginal'), tags: ['encierro', 'poder'] },
  { text: 'Tumberos', author: 'Adrián Caetano', kind: 'serie', year: 2002, license: 'metadata_only', externalLink: wiki('Tumberos'), tags: ['encierro', 'justicia'] },
  { text: 'Muchacha ojos de papel', author: 'Luis Alberto Spinetta', kind: 'canción', year: 1969, license: 'metadata_only', externalLink: yt('Muchacha ojos de papel Almendra'), tags: ['juventud', 'amor'] },
  { text: 'De música ligera', author: 'Soda Stereo', kind: 'canción', year: 1990, license: 'metadata_only', externalLink: yt('De música ligera Soda Stereo'), tags: ['noche', 'baile'] },
  { text: 'La ciudad de la furia', author: 'Soda Stereo', kind: 'canción', year: 1988, license: 'metadata_only', externalLink: yt('La ciudad de la furia Soda Stereo'), tags: ['ciudad', 'vértigo'] },
  { text: 'Los dinosaurios', author: 'Charly García', kind: 'canción', year: 1983, license: 'metadata_only', externalLink: yt('Los dinosaurios Charly García'), tags: ['memoria', 'política'] },
  { text: 'Tumbas de la gloria', author: 'Fito Páez', kind: 'canción', year: 1992, license: 'metadata_only', externalLink: yt('Tumbas de la gloria Fito Páez'), tags: ['fama', 'tiempo'] },
  { text: 'Flaca', author: 'Andrés Calamaro', kind: 'canción', year: 1997, license: 'metadata_only', externalLink: yt('Flaca Andrés Calamaro'), tags: ['amor', 'bar'] },
  { text: 'Como la cigarra', author: 'María Elena Walsh', kind: 'canción', year: 1973, license: 'metadata_only', externalLink: yt('Como la cigarra María Elena Walsh'), tags: ['resiliencia', 'canto'] },
];

export const characters: RawCultural[] = [
  { text: 'Emma Bovary', author: 'Gustave Flaubert', work: 'Madame Bovary', kind: 'libro', license: 'metadata_only', externalLink: wiki('Emma Bovary'), extra: { description: 'Una mujer que busca en el deseo una salida a la monotonía de su vida provinciana.' } },
  { text: 'Anna Karénina', author: 'León Tolstói', work: 'Anna Karénina', kind: 'libro', license: 'metadata_only', externalLink: wiki('Anna Karénina'), extra: { description: 'Una mujer que elige el amor por encima de las reglas de su tiempo y paga el precio.' } },
  { text: 'Gregor Samsa', author: 'Franz Kafka', work: 'La metamorfosis', kind: 'libro', license: 'metadata_only', externalLink: wiki('Gregor Samsa'), extra: { description: 'Un hombre que despierta convertido en otra cosa y descubre cómo lo mira su familia.' } },
  { text: 'Raskólnikov', author: 'Fiódor Dostoievski', work: 'Crimen y castigo', kind: 'libro', license: 'metadata_only', externalLink: wiki('Rodión Raskólnikov'), extra: { description: 'Un joven que justifica un crimen con ideas y luego no puede sostener el silencio.' } },
  { text: 'Sherlock Holmes', author: 'Arthur Conan Doyle', work: 'Las aventuras de Sherlock Holmes', kind: 'libro', license: 'metadata_only', externalLink: wiki('Sherlock Holmes'), extra: { description: 'Un detective que lee el mundo como una cadena de detalles que nadie más ve.' } },
  { text: 'Elizabeth Bennet', author: 'Jane Austen', work: 'Orgullo y prejuicio', kind: 'libro', license: 'metadata_only', externalLink: wiki('Elizabeth Bennet'), extra: { description: 'Una mujer ingeniosa que aprende a desconfiar de sus propias primeras impresiones.' } },
  { text: 'Drácula', author: 'Bram Stoker', work: 'Drácula', kind: 'libro', license: 'metadata_only', externalLink: wiki('Drácula'), extra: { description: 'Una presencia antigua que seduce y aísla a quienes se le acercan.' } },
  { text: 'La criatura', author: 'Mary Shelley', work: 'Frankenstein', kind: 'libro', license: 'metadata_only', externalLink: wiki('Frankenstein'), extra: { description: 'Un ser creado con retazos que busca afecto y encuentra rechazo.' } },
  { text: 'Meursault', author: 'Albert Camus', work: 'El extranjero', kind: 'libro', license: 'metadata_only', externalLink: wiki('El extranjero'), extra: { description: 'Un hombre que narra su vida sin emoción y descubre el juicio de los demás.' } },
  { text: 'Daisy Buchanan', author: 'F. Scott Fitzgerald', work: 'El gran Gatsby', kind: 'libro', license: 'metadata_only', externalLink: wiki('El gran Gatsby'), extra: { description: 'Una mujer que habita una fiesta permanente y teme el silencio después.' } },
  { text: 'Holden Caulfield', author: 'J. D. Salinger', work: 'El guardián entre el centeno', kind: 'libro', license: 'metadata_only', externalLink: wiki('El guardián entre el centeno'), extra: { description: 'Un adolescente que critica a todos para no mirar lo que le pasa a él.' } },
  { text: 'Orlando', author: 'Virginia Woolf', work: 'Orlando', kind: 'libro', license: 'metadata_only', externalLink: wiki('Orlando novela'), extra: { description: 'Una persona que atraviesa siglos y cambia de cuerpo sin perder la memoria.' } },
  { text: 'Ireneo Funes', author: 'Jorge Luis Borges', work: 'Funes el memorioso', kind: 'cuento', license: 'metadata_only', externalLink: wiki('Funes el memorioso'), extra: { description: 'Un hombre que recuerda cada detalle y por eso no puede pensar.' } },
  { text: 'Emma Zunz', author: 'Jorge Luis Borges', work: 'Emma Zunz', kind: 'cuento', license: 'metadata_only', externalLink: wiki('Emma Zunz'), extra: { description: 'Una mujer que arma una venganza como si escribiera un relato.' } },
  { text: 'Juan Dahlmann', author: 'Jorge Luis Borges', work: 'El sur', kind: 'cuento', license: 'metadata_only', externalLink: wiki('El sur Borges'), extra: { description: 'Un bibliotecario que elige morir dentro de un recuerdo que lo justifique.' } },
  { text: 'La Maga', author: 'Julio Cortázar', work: 'Rayuela', kind: 'libro', license: 'metadata_only', externalLink: wiki('Rayuela novela'), extra: { description: 'Una mujer que desarma la lógica de quienes creen entenderla.' } },
  { text: 'Horacio Oliveira', author: 'Julio Cortázar', work: 'Rayuela', kind: 'libro', license: 'metadata_only', externalLink: wiki('Rayuela novela'), extra: { description: 'Un hombre que busca una verdad en los márgenes y se pierde en su propia inteligencia.' } },
  { text: 'Martín Fierro', author: 'José Hernández', work: 'El gaucho Martín Fierro', kind: 'poema', license: 'metadata_only', externalLink: wiki('Martín Fierro'), extra: { description: 'Un gaucho que cuenta cómo el desierto y la ley lo van dejando sin nada.' } },
  { text: 'Pedro Páramo', author: 'Juan Rulfo', work: 'Pedro Páramo', kind: 'libro', license: 'metadata_only', externalLink: wiki('Pedro Páramo'), extra: { description: 'Un padre poderoso que sigue gobernando un pueblo lleno de murmullos.' } },
  { text: 'Florentino Ariza', author: 'Gabriel García Márquez', work: 'El amor en los tiempos del cólera', kind: 'libro', license: 'metadata_only', externalLink: wiki('El amor en los tiempos del cólera'), extra: { description: 'Un hombre que espera medio siglo sin dejar de escribir cartas.' } },
  { text: 'Úrsula Iguarán', author: 'Gabriel García Márquez', work: 'Cien años de soledad', kind: 'libro', license: 'metadata_only', externalLink: wiki('Cien años de soledad'), extra: { description: 'La mujer que sostiene una casa mientras el tiempo se repite.' } },
  { text: 'Aureliano Buendía', author: 'Gabriel García Márquez', work: 'Cien años de soledad', kind: 'libro', license: 'metadata_only', externalLink: wiki('Cien años de soledad'), extra: { description: 'Un hombre que gana guerras y pierde todas las razones para hacerlas.' } },
  { text: 'Don Quijote', author: 'Miguel de Cervantes', work: 'Don Quijote de la Mancha', kind: 'libro', license: 'metadata_only', externalLink: wiki('Don Quijote'), extra: { description: 'Un lector que decide que la realidad debe parecerse a los libros.' } },
  { text: 'Sancho Panza', author: 'Miguel de Cervantes', work: 'Don Quijote de la Mancha', kind: 'libro', license: 'metadata_only', externalLink: wiki('Sancho Panza'), extra: { description: 'Un acompañante que duda de todo pero no abandona a su amigo.' } },
  { text: 'Tom Sawyer', author: 'Mark Twain', work: 'Las aventuras de Tom Sawyer', kind: 'libro', license: 'metadata_only', externalLink: wiki('Tom Sawyer'), extra: { description: 'Un chico que convierte cualquier obligación en una aventura.' } },
  { text: 'Alicia', author: 'Lewis Carroll', work: 'Alicia en el país de las maravillas', kind: 'libro', license: 'metadata_only', externalLink: wiki('Alicia en el país de las maravillas'), extra: { description: 'Una niña que acepta las reglas absurdas de un mundo nuevo para poder cruzarlo.' } },
  { text: 'Dorian Gray', author: 'Oscar Wilde', work: 'El retrato de Dorian Gray', kind: 'libro', license: 'metadata_only', externalLink: wiki('El retrato de Dorian Gray'), extra: { description: 'Un hombre que conserva la juventud mientras su retrato envejece por él.' } },
  { text: 'Heathcliff', author: 'Emily Brontë', work: 'Cumbres borrascosas', kind: 'libro', license: 'metadata_only', externalLink: wiki('Cumbres borrascosas'), extra: { description: 'Un hombre que vuelve al lugar donde fue humillado para cobrarse todo.' } },
];

export const songs: RawCultural[] = [
  { text: 'Muchacha ojos de papel', author: 'Almendra', year: 1969, license: 'metadata_only', externalLink: yt('Muchacha ojos de papel Almendra'), tags: ['juventud', 'amor'] },
  { text: 'De música ligera', author: 'Soda Stereo', year: 1990, license: 'metadata_only', externalLink: yt('De música ligera Soda Stereo'), tags: ['noche', 'baile'] },
  { text: 'Persiana americana', author: 'Soda Stereo', year: 1985, license: 'metadata_only', externalLink: yt('Persiana americana Soda Stereo'), tags: ['deseo', 'noche'] },
  { text: 'Cuando pase el temblor', author: 'Soda Stereo', year: 1985, license: 'metadata_only', externalLink: yt('Cuando pase el temblor Soda Stereo'), tags: ['esperanza', 'ritmo'] },
  { text: 'La ciudad de la furia', author: 'Soda Stereo', year: 1988, license: 'metadata_only', externalLink: yt('La ciudad de la furia Soda Stereo'), tags: ['ciudad', 'vértigo'] },
  { text: 'Seminare', author: 'Serú Girán', year: 1978, license: 'metadata_only', externalLink: yt('Seminare Serú Girán'), tags: ['libertad', 'camino'] },
  { text: 'Eiti Leda', author: 'Serú Girán', year: 1978, license: 'metadata_only', externalLink: yt('Eiti Leda Serú Girán'), tags: ['fiesta', 'mar'] },
  { text: 'Costumbres argentinas', author: 'Los Abuelos de la Nada', year: 1983, license: 'metadata_only', externalLink: yt('Costumbres argentinas Los Abuelos de la Nada'), tags: ['barrio', 'memoria'] },
  { text: 'Lunes por la madrugada', author: 'Los Abuelos de la Nada', year: 1983, license: 'metadata_only', externalLink: yt('Lunes por la madrugada Los Abuelos de la Nada'), tags: ['madrugada', 'soledad'] },
  { text: 'Los dinosaurios', author: 'Charly García', year: 1983, license: 'metadata_only', externalLink: yt('Los dinosaurios Charly García'), tags: ['memoria', 'política'] },
  { text: 'No bombardeen Buenos Aires', author: 'Charly García', year: 1982, license: 'metadata_only', externalLink: yt('No bombardeen Buenos Aires Charly García'), tags: ['ciudad', 'miedo'] },
  { text: 'Rezo por vos', author: 'Charly García y Luis Alberto Spinetta', year: 1986, license: 'metadata_only', externalLink: yt('Rezo por vos Charly Spinetta'), tags: ['fe', 'amor'] },
  { text: 'Tumbas de la gloria', author: 'Fito Páez', year: 1992, license: 'metadata_only', externalLink: yt('Tumbas de la gloria Fito Páez'), tags: ['fama', 'tiempo'] },
  { text: 'El amor después del amor', author: 'Fito Páez', year: 1992, license: 'metadata_only', externalLink: yt('El amor después del amor Fito Páez'), tags: ['amor', 'renacer'] },
  { text: '11 y 6', author: 'Fito Páez', year: 1985, license: 'metadata_only', externalLink: yt('11 y 6 Fito Páez'), tags: ['barrio', 'encuentro'] },
  { text: 'Flaca', author: 'Andrés Calamaro', year: 1997, license: 'metadata_only', externalLink: yt('Flaca Andrés Calamaro'), tags: ['amor', 'bar'] },
  { text: 'Estadio Azteca', author: 'Andrés Calamaro', year: 1997, license: 'metadata_only', externalLink: yt('Estadio Azteca Andrés Calamaro'), tags: ['fútbol', 'nostalgia'] },
  { text: 'La parte de adelante', author: 'Andrés Calamaro', year: 1999, license: 'metadata_only', externalLink: yt('La parte de adelante Andrés Calamaro'), tags: ['ciudad', 'noche'] },
  { text: 'Como la cigarra', author: 'María Elena Walsh', year: 1973, license: 'metadata_only', externalLink: yt('Como la cigarra María Elena Walsh'), tags: ['resiliencia', 'canto'] },
  { text: 'Serenata para la tierra de uno', author: 'María Elena Walsh', year: 1969, license: 'metadata_only', externalLink: yt('Serenata para la tierra de uno'), tags: ['tierra', 'exilio'] },
  { text: 'El reino del revés', author: 'María Elena Walsh', year: 1969, license: 'metadata_only', externalLink: yt('El reino del revés María Elena Walsh'), tags: ['juego', 'infancia'] },
  { text: 'Gracias a la vida', author: 'Violeta Parra', year: 1966, license: 'metadata_only', externalLink: yt('Gracias a la vida Violeta Parra'), tags: ['gratitud', 'vida'] },
  { text: 'Alfonsina y el mar', author: 'Ariel Ramírez y Félix Luna', year: 1969, license: 'metadata_only', externalLink: yt('Alfonsina y el mar'), tags: ['mar', 'despedida'] },
  { text: 'Todo cambia', author: 'Julio Numhauser', year: 1982, license: 'metadata_only', externalLink: yt('Todo cambia Mercedes Sosa'), tags: ['cambio', 'tiempo'] },
];

export const poemsSongsRef: RawCultural[] = [
  { text: 'Rimas', author: 'Gustavo Adolfo Bécquer', kind: 'poemario', license: 'metadata_only', externalLink: wiki('Rimas Bécquer') },
  { text: 'Soledades, galerías y otros poemas', author: 'Antonio Machado', kind: 'poemario', license: 'metadata_only', externalLink: wiki('Soledades Antonio Machado') },
  { text: 'Martín Fierro', author: 'José Hernández', kind: 'poema', license: 'metadata_only', externalLink: wiki('Martín Fierro') },
  { text: 'La vida es sueño', author: 'Pedro Calderón de la Barca', kind: 'teatro', license: 'metadata_only', externalLink: wiki('La vida es sueño') },
  { text: 'El Quijote', author: 'Miguel de Cervantes', kind: 'novela', license: 'metadata_only', externalLink: wiki('Don Quijote') },
  { text: 'Cantos de vida y esperanza', author: 'Rubén Darío', kind: 'poemario', license: 'metadata_only', externalLink: wiki('Cantos de vida y esperanza') },
  { text: 'Versos sencillos', author: 'José Martí', kind: 'poemario', license: 'metadata_only', externalLink: wiki('Versos sencillos') },
  { text: 'Poeta en Nueva York', author: 'Federico García Lorca', kind: 'poemario', license: 'metadata_only', externalLink: wiki('Poeta en Nueva York') },
  { text: 'El rayo que no cesa', author: 'Miguel Hernández', kind: 'poemario', license: 'metadata_only', externalLink: wiki('El rayo que no cesa') },
  { text: 'Los heraldos negros', author: 'César Vallejo', kind: 'poemario', license: 'metadata_only', externalLink: wiki('Los heraldos negros') },
  { text: 'Residencia en la tierra', author: 'Pablo Neruda', kind: 'poemario', license: 'metadata_only', externalLink: wiki('Residencia en la tierra') },
  { text: 'Oda al mar', author: 'Pablo Neruda', kind: 'poema', license: 'metadata_only', externalLink: wiki('Odas elementales Neruda') },
  { text: 'El jinete insomne', author: 'César Vallejo', kind: 'poema', license: 'metadata_only', externalLink: wiki('César Vallejo') },
  { text: 'Muchacha ojos de papel', author: 'Luis Alberto Spinetta', kind: 'canción', license: 'metadata_only', externalLink: yt('Muchacha ojos de papel') },
  { text: 'Seminare', author: 'Charly García', kind: 'canción', license: 'metadata_only', externalLink: yt('Seminare Serú Girán') },
  { text: 'Como la cigarra', author: 'María Elena Walsh', kind: 'canción', license: 'metadata_only', externalLink: yt('Como la cigarra') },
  { text: 'Gracias a la vida', author: 'Violeta Parra', kind: 'canción', license: 'metadata_only', externalLink: yt('Gracias a la vida') },
  { text: 'Alfonsina y el mar', author: 'Ariel Ramírez y Félix Luna', kind: 'canción', license: 'metadata_only', externalLink: yt('Alfonsina y el mar') },
  { text: 'La ciudad de la furia', author: 'Soda Stereo', kind: 'canción', license: 'metadata_only', externalLink: yt('La ciudad de la furia') },
  { text: 'Los dinosaurios', author: 'Charly García', kind: 'canción', license: 'metadata_only', externalLink: yt('Los dinosaurios') },
  { text: 'El reino del revés', author: 'María Elena Walsh', kind: 'canción', license: 'metadata_only', externalLink: yt('El reino del revés') },
];

export const quotes: RawCultural[] = [
  { text: 'La vida es sueño, y los sueños, sueños son.', author: 'Pedro Calderón de la Barca', work: 'La vida es sueño', year: 1635, license: 'public_domain', externalLink: wiki('La vida es sueño'), tags: ['sueño', 'tiempo'] },
  { text: 'Caminante, no hay camino: se hace camino al andar.', author: 'Antonio Machado', work: 'Proverbios y cantares', year: 1912, license: 'public_domain', externalLink: wiki('Antonio Machado'), tags: ['camino', 'viaje'] },
  { text: 'Volverán las oscuras golondrinas en tu balcón sus nidos a colgar.', author: 'Gustavo Adolfo Bécquer', work: 'Rima LIII', year: 1868, license: 'public_domain', externalLink: wiki('Rimas Bécquer'), tags: ['regreso', 'amor'] },
  { text: 'Yo soy aquel que ayer no más decía el verso azul y la canción profana.', author: 'Rubén Darío', work: 'Cantos de vida y esperanza', year: 1905, license: 'public_domain', externalLink: wiki('Rubén Darío'), tags: ['pasado', 'voz'] },
  { text: 'Cultivo una rosa blanca en junio como en enero.', author: 'José Martí', work: 'Versos sencillos', year: 1891, license: 'public_domain', externalLink: wiki('José Martí'), tags: ['amistad', 'sinceridad'] },
  { text: 'La primavera ha venido; nadie sabe cómo ha sido.', author: 'Antonio Machado', work: 'Soledades', year: 1907, license: 'public_domain', externalLink: wiki('Antonio Machado'), tags: ['primavera', 'misterio'] },
  { text: 'Sospecho que el silencio también se puede heredar.', license: 'original', author: 'De la casa', tags: ['silencio', 'familia'] },
  { text: 'Hay domingos que duran más que una vida.', license: 'original', author: 'De la casa', tags: ['domingo', 'tiempo'] },
  { text: 'Guardé tu nombre donde se guardan las llaves que ya no abren nada.', license: 'original', author: 'De la casa', tags: ['olvido', 'amor'] },
  { text: 'La ciudad tiene una voz distinta cuando llueve.', license: 'original', author: 'De la casa', tags: ['ciudad', 'lluvia'] },
  { text: 'Aprendí a despedirme sin cerrar del todo la puerta.', license: 'original', author: 'De la casa', tags: ['despedida', 'costumbre'] },
  { text: 'Nadie te enseña a volver a una casa que ya no es tuya.', license: 'original', author: 'De la casa', tags: ['casa', 'regreso'] },
  { text: 'El amor también es una forma de la paciencia.', license: 'original', author: 'De la casa', tags: ['amor', 'espera'] },
  { text: 'Hay noches en que la luz de la heladera es la única compañía.', license: 'original', author: 'De la casa', tags: ['soledad', 'noche'] },
  { text: 'Mi madre planchaba el silencio como si fuera una camisa.', license: 'original', author: 'De la casa', tags: ['familia', 'silencio'] },
  { text: 'Todo lo que no dije sigue viviendo en algún cajón.', license: 'original', author: 'De la casa', tags: ['silencio', 'memoria'] },
  { text: 'El barrio cambió de nombre pero no de olor.', license: 'original', author: 'De la casa', tags: ['barrio', 'memoria'] },
  { text: 'La nostalgia es una casa con las luces encendidas.', license: 'original', author: 'De la casa', tags: ['nostalgia', 'casa'] },
  { text: 'Un día vas a entender por qué tu padre miraba tanto la ruta.', license: 'original', author: 'De la casa', tags: ['familia', 'ruta'] },
  { text: 'El miedo también tiene una forma de caminar.', license: 'original', author: 'De la casa', tags: ['miedo', 'cuerpo'] },
  { text: 'Se puede extrañar algo que nunca pasó.', license: 'original', author: 'De la casa', tags: ['nostalgia', 'deseo'] },
  { text: 'La lluvia borra el camino pero deja el barro.', license: 'original', author: 'De la casa', tags: ['lluvia', 'huella'] },
  { text: 'Hay personas que son un lugar, no una historia.', license: 'original', author: 'De la casa', tags: ['amor', 'lugar'] },
  { text: 'Escribo para que el tiempo no me gane de mano.', license: 'original', author: 'De la casa', tags: ['escritura', 'tiempo'] },
];

export const scriptPhrases: RawCultural[] = [
  { text: '—¿Y si no vuelvo? —Entonces yo voy a seguir esperando en la misma esquina.', license: 'original', author: 'De la casa', work: 'Escena de la esquina', tags: ['espera', 'despedida'] },
  { text: '—No es que no te quiera. Es que no sé quedarme quieto.', license: 'original', author: 'De la casa', work: 'Escena del tren', tags: ['amor', 'huida'] },
  { text: '—¿Vos te acordás de mí? —Todos los días, pero nunca a la misma hora.', license: 'original', author: 'De la casa', work: 'Escena del bar', tags: ['memoria', 'encuentro'] },
  { text: '—El silencio no es una respuesta. —A veces es la única que tengo.', license: 'original', author: 'De la casa', work: 'Escena de la cocina', tags: ['silencio', 'familia'] },
  { text: '—¿Por qué no me avisaste? —Porque quería que fuera una sorpresa, no una explicación.', license: 'original', author: 'De la casa', work: 'Escena del cumpleaños', tags: ['sorpresa', 'culpa'] },
  { text: '—Me voy a la ciudad. —La ciudad no te va a devolver lo que dejás acá.', license: 'original', author: 'De la casa', work: 'Escena del andén', tags: ['viaje', 'ciudad'] },
  { text: '—No tengo miedo de morir. Tengo miedo de que nadie se dé cuenta.', license: 'original', author: 'De la casa', work: 'Escena del hospital', tags: ['miedo', 'soledad'] },
  { text: '—¿Siempre fuiste así? —No. Me fui haciendo así para que no me lastimaran.', license: 'original', author: 'De la casa', work: 'Escena del espejo', tags: ['identidad', 'herida'] },
  { text: '—La casa está en venta. —La casa está en venta desde que nos fuimos.', license: 'original', author: 'De la casa', work: 'Escena de la mudanza', tags: ['casa', 'pérdida'] },
  { text: '—Te llamé tres veces. —Y yo te escuché las tres.', license: 'original', author: 'De la casa', work: 'Escena del teléfono', tags: ['comunicación', 'culpa'] },
  { text: '—No me acuerdo de mi cara de antes. —Yo sí. Y te queda mejor.', license: 'original', author: 'De la casa', work: 'Escena del reencuentro', tags: ['cambio', 'memoria'] },
  { text: '—¿Vamos a volver? —Volver es una palabra que inventaron los que se quedaron.', license: 'original', author: 'De la casa', work: 'Escena del viaje', tags: ['regreso', 'distancia'] },
];

export const images: RawCultural[] = Array.from({ length: 30 }, (_, i) => ({
  text: `Composición ${i + 1}`,
  author: 'Cancioneta',
  license: 'original' as const,
  attribution: 'Ilustración original de Cancioneta',
  tags: [
    ['niebla', 'nostalgia', 'azul'],
    ['fuego', 'fiesta', 'rojo'],
    ['lluvia', 'soledad', 'gris'],
    ['campo', 'infancia', 'verde'],
    ['noche', 'deseo', 'violeta'],
    ['verano', 'luz', 'dorado'],
  ][i % 6],
  extra: { seed: i + 1, palette: i % 6, form: i % 5 },
}));
