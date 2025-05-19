import React from "react";

import {
  CheckCircle,
  ArrowRight,
  Star,
  Users,
  FileText,
  BarChart,
} from "lucide-react";
import photo from "/images/freedonm-hr.jpg";
import waveImg from "/images/wave.svg";

const Testimonial: React.FC<{
  name: string;
  company: string;
  content: string;
}> = ({ name, company, content }) => (
  <div className="bg-white border-2 border-l-deepBlue p-6 rounded-lg shadow-md">
    <p className="text-gray-600 mb-4">{content}</p>
    <div className="flex items-center">
      <div className="mr-4">
        <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
      </div>
      <div>
        <p className="font-semibold">{name}</p>
        <p className="text-sm text-gray-500">{company}</p>
      </div>
    </div>
  </div>
);

const PricingPlan: React.FC<{
  name: string;
  price: string;
  features: string[];
}> = ({ name, price, features }) => (
  <div className="bg-white p-6 rounded-lg shadow-md flex flex-col border-2 border-deepBlue">
    <h3 className="text-xl font-semibold mb-4">{name}</h3>
    <p className="text-3xl font-bold mb-6">{price}</p>
    <ul className="mb-6 flex-grow">
      {features.map((feature, index) => (
        <li key={index} className="flex items-center mb-2">
          <CheckCircle className="w-5 h-5 text-brightBlue mr-2" />
          <span>{feature}</span>
        </li>
      ))}
    </ul>
    <button className="bg-brightBlue text-white px-4 py-2 rounded-full hover:bg-deepBlue transition-colors">
      Выбрать план
    </button>
  </div>
);

const LandingPage: React.FC = () => {
  return (
    <div className="bg-white min-h-screen">
      <main>
        <section className="container  mx-auto  px-16 pt-24 pb-20">
          <div className="relative">
            <img
              src={waveImg}
              alt=""
              className="absolute top-20 left-20 w-40 h-40 rotate-45"
            />

            <img
              src={waveImg}
              alt=""
              className="absolute top-20 right-20 w-40 h-40 -rotate-45"
            />
          </div>
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">
              Добро пожаловать в HR Analyzer
            </h1>
            <p className="text-xl text-muteGray mb-8">
              Революционизируйте процесс найма с помощью AI-powered аналитики
            </p>
            <a
              href="/signup"
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-full text-white bg-brightBlue hover:bg-deepBlue transition-colors"
            >
              Начать <ArrowRight className="ml-2 h-5 w-5" />
            </a>
          </div>
        </section>

        <section className="container mx-auto px-16 py-12 ">
          <h2 className="text-3xl font-bold text-center mb-2 text-brightBlue">
            Чем мы помогаем?
          </h2>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <ul className="space-y-4">
                <li className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-brightBlue mr-2 flex-shrink-0" />
                  <span>Легко публикуйте и отслеживайте вакансии</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-brightBlue mr-2 flex-shrink-0" />
                  <span>Автоматически анализируйте резюме с помощью ИИ</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-brightBlue mr-2 flex-shrink-0" />
                  <span>
                    Получайте оценки соответствия и аналитику по каждому
                    кандидату
                  </span>
                </li>
              </ul>
              <p className="text-muteGray">
                Наша платформа помогает HR-специалистам принимать решения на
                основе данных, экономя время и улучшая качество найма.
              </p>
              <a
                href="/signup"
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-full text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                Попробовать <ArrowRight className="ml-2 h-5 w-5" />
              </a>
            </div>
            <img src={photo} alt="hr Analyzer" />
          </div>
        </section>

        <section className="bg-white py-12">
          <div className="container mx-auto px-16">
            <h2 className="text-3xl font-semibold text-center mb-12">
              Ключевые возможности
            </h2>
            <div className="grid md:grid-cols-4 gap-8">
              <div className="text-center transition-transform duration-300 hover:-translate-y-2">
                <FileText className="w-12 h-12 text-brightBlue mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  Управление вакансиями
                </h3>
                <p className="text-gray-600">
                  Создавайте и управляйте вакансиями с подробными описаниями и
                  требованиями.
                </p>
              </div>
              <div className="text-center transition-transform duration-300 hover:-translate-y-2">
                <Users className="w-12 h-12 text-brightBlue mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  Отслеживание кандидатов
                </h3>
                <p className="text-gray-600">
                  Следите за кандидатами, их оценками соответствия и причинами
                  подходящести в одном месте.
                </p>
              </div>
              <div className="text-center transition-transform duration-300 hover:-translate-y-2">
                <BarChart className="w-12 h-12 text-brightBlue mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Анализ резюме</h3>
                <p className="text-gray-600">
                  Автоматически анализируйте резюме для извлечения ключевой
                  информации и расчета оценок соответствия.
                </p>
              </div>
              <div className="text-center transition-transform duration-300 hover:-translate-y-2">
                <Star className="w-12 h-12 text-brightBlue mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  Инсайты о кандидатах
                </h3>
                <p className="text-gray-600">
                  Получайте ценные инсайты о навыках, опыте и подходящести
                  кандидатов для роли.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12">
          <div className="container mx-auto px-16">
            <h2 className="text-3xl font-semibold text-center mb-12">
              Отзывы клиентов
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <Testimonial
                name="Анна Петрова"
                company="ТехноСофт"
                content="HR Analyzer значительно упростил наш процесс найма. Мы экономим часы на анализе резюме и находим лучших кандидатов быстрее, чем когда-либо."
              />
              <Testimonial
                name="Иван Сидоров"
                company="ФинансПлюс"
                content="Аналитика, предоставляемая платформой, помогла нам улучшить наши объявления о вакансиях и процесс отбора. Качество наших новых сотрудников заметно выросло."
              />
              <Testimonial
                name="Елена Козлова"
                company="МедиаГрупп"
                content="Интуитивно понятный интерфейс и мощные функции анализа делают HR Analyzer незаменимым инструментом для нашей HR-команды."
              />
            </div>
          </div>
        </section>

        <section className="bg-white py-12">
          <div className="container mx-auto px-16">
            <h2 className="text-3xl font-semibold text-center mb-12 text-deepBlue">
              Тарифные планы
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <PricingPlan
                name="Базовый"
                price="5 000 KZT/мес"
                features={[
                  "До 10 активных вакансий",
                  "Базовый анализ резюме",
                  "Отслеживание кандидатов",
                  "Email поддержка",
                ]}
              />
              <PricingPlan
                name="Профессиональный"
                price="15 000 KZT/мес"
                features={[
                  "До 50 активных вакансий",
                  "Расширенный анализ резюме",
                  "Продвинутая аналитика",
                  "Приоритетная поддержка",
                ]}
              />
              <PricingPlan
                name="Корпоративный"
                price="Индивидуально"
                features={[
                  "Неограниченное количество вакансий",
                  "Полный анализ резюме и кандидатов",
                  "Настраиваемая аналитика",
                  "API доступ",
                  "Выделенный менеджер",
                ]}
              />
            </div>
          </div>
        </section>

        <section className="py-12">
          <div className="container mx-auto px-16 border-">
            <h2 className="text-3xl font-semibold text-center mb-12">
              Часто задаваемые вопросы
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="border-2 p-4 rounded-lg border-deepBlue shadow-lg">
                <h3 className="text-xl font-semibold mb-2 underline">
                  Как работает анализ резюме с помощью ИИ?
                </h3>
                <p className="text-gray-600">
                  Наш ИИ использует передовые алгоритмы обработки естественного
                  языка для извлечения ключевой информации из резюме,
                  сопоставления навыков с требованиями вакансии и оценки
                  соответствия кандидата.
                </p>
              </div>
              <div className="border-2 p-4 rounded-lg border-deepBlue ">
                <h3 className="text-xl font-semibold mb-2 underline">
                  Можно ли интегрировать HR Analyzer с нашей текущей ATS?
                </h3>
                <p className="text-gray-600">
                  Да, мы предлагаем интеграции с популярными ATS системами. Для
                  получения подробной информации о конкретных интеграциях,
                  пожалуйста, свяжитесь с нашей командой поддержки.
                </p>
              </div>
              <div className="border-2 p-4 rounded-lg border-deepBlue ">
                <h3 className="text-xl font-semibold mb-2 underline">
                  Насколько безопасны данные кандидатов на вашей платформе?
                </h3>
                <p className="text-gray-600">
                  Мы придаем первостепенное значение безопасности данных. Вся
                  информация шифруется при передаче и хранении, и мы соблюдаем
                  строгие протоколы безопасности и соответствуем стандартам
                  защиты данных.
                </p>
              </div>
              <div className="border-2 p-4 rounded-lg border-deepBlue ">
                <h3 className="text-xl font-semibold mb-2 underline">
                  Предоставляете ли вы обучение по использованию платформы?
                </h3>
                <p className="text-gray-600">
                  Да, мы предлагаем комплексное обучение для всех новых
                  клиентов, а также регулярные вебинары и ресурсы для
                  непрерывного обучения, чтобы помочь вам максимально эффективно
                  использовать нашу платформу.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-blue-600 text-white py-12">
          <div className="container mx-auto px-12 text-center">
            <h2 className="text-3xl font-semibold mb-4">
              Готовы улучшить ваш процесс найма?
            </h2>
            <p className="text-xl mb-8">
              Присоединяйтесь к тысячам компаний, использующих HR Analyzer для
              поиска лучших талантов.
            </p>
            <a
              href="/signup"
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-full text-blue-600 bg-white hover:bg-gray-50 transition-colors"
            >
              Начать сейчас <ArrowRight className="ml-2 h-5 w-5" />
            </a>
          </div>
        </section>
      </main>

      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-12">
          <div className="grid md:grid-cols-4 gap-16">
            <div>
              <h3 className="text-lg font-semibold mb-4">HR Analyzer</h3>
              <p className="text-sm text-gray-400">
                Революционизируем процесс найма с помощью ИИ и аналитики.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Продукт</h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-sm text-gray-400 hover:text-white"
                  >
                    Возможности
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-gray-400 hover:text-white"
                  >
                    Цены
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-gray-400 hover:text-white"
                  >
                    Интеграции
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Компания</h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-sm text-gray-400 hover:text-white"
                  >
                    О нас
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-gray-400 hover:text-white"
                  >
                    Блог
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-gray-400 hover:text-white"
                  >
                    Карьера
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Поддержка</h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-sm text-gray-400 hover:text-white"
                  >
                    Документация
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-gray-400 hover:text-white"
                  >
                    Контакты
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-gray-400 hover:text-white"
                  >
                    FAQ
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-700 text-center">
            <p className="text-sm text-gray-400">
              &copy; {new Date().getFullYear()} HR Analyzer. Все права защищены.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
