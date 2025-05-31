import React from "react";

// Importe seus arquivos de imagem (PNG) ou SVG aqui
// Certifique-se de que o caminho do arquivo esteja correto e o nome da importação seja único
import SementePng from "../assets/insignias/semente.png";
import FolhaPng from "../assets/insignias/folha.png";
import BrotoPng from "../assets/insignias/Broto.png";
import ArvoresPng from "../assets/insignias/Arvores.png";
import ArvoreComMacaPng from "../assets/insignias/arvorecommaca.png";


// Mapeamento dos nomes dos ícones (definidos em pomodoroAchievements.ts) para os recursos importados
const INSIGNIA_RESOURCE_MAP: Record<
  string,
  string | React.FC<React.SVGProps<SVGSVGElement>>
> = {
  "insignia-semente": SementePng, 
  "insignia-folha": FolhaPng,
  "insignia-estrela-1": BrotoPng, 
  "insignia-dias": ArvoreComMacaPng,
  "insignia-estrela-3": ArvoresPng,
};

interface PomodoroAchievementIconProps {
  iconName: string;
  isUnlocked: boolean;
}

const PomodoroAchievementIcon: React.FC<PomodoroAchievementIconProps> = ({
  iconName,
  isUnlocked,
}) => {
  const InsigniaResource = INSIGNIA_RESOURCE_MAP[iconName];

  // Classes para estilizar a insígnia (tamanho, opacidade, grayscale se bloqueado)
  const iconClasses = `w-10 h-10 ${
    isUnlocked ? "opacity-100" : "opacity-50 grayscale"
  }`;

  if (!InsigniaResource || InsigniaResource === "") {
    // Adicionado verificação para string vazia
    // Retorna um placeholder se o ícone não for encontrado ou mapeado incorretamente
    console.warn(
      `Recurso da insígnia "${iconName}" não encontrado ou mapeado incorretamente.`
    );
    return (
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center bg-gray-300 text-gray-700 ${iconClasses}`}
      >
        ?
      </div>
    );
  }

  if (typeof InsigniaResource === "function") {
    const SvgComponent = InsigniaResource as React.FC<
      React.SVGProps<SVGSVGElement>
    >;
    return (
      <div className="flex-shrink-0">
        {" "}
        {/* Adicionar flex-shrink para evitar que o ícone diminua */}
        <SvgComponent className={iconClasses} />
      </div>
    );
  } else {

    return (
      <div className="flex-shrink-0">
        <img
          src={InsigniaResource}
          alt={`Insignia: ${iconName}`}
          className={iconClasses}
        />
      </div>
    );
  }
};

export default PomodoroAchievementIcon;
