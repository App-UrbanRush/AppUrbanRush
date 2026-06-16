import re

class SpanishLexicon:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._lexicon = cls._build_lexicon()
        return cls._instance

    @staticmethod
    def _build_lexicon():
        lex = {}

        positive = [
            ("excelente", 2.5), ("excelentes", 2.5),
            ("perfecto", 2.5), ("perfecta", 2.5), ("perfectos", 2.5), ("perfectas", 2.5),
            ("increíble", 2.5), ("increible", 2.5),
            ("maravilloso", 2.8), ("maravillosa", 2.8),
            ("fantástico", 2.5), ("fantastico", 2.5),
            ("espectacular", 2.8), ("espectaculares", 2.8),
            ("magnífico", 2.5), ("magnifico", 2.5),
            ("bueno", 1.5), ("buena", 1.5), ("buenos", 1.5), ("buenas", 1.5),
            ("riquísimo", 2.8), ("riquisimo", 2.8),
            ("delicioso", 2.5), ("deliciosa", 2.5),
            ("sabroso", 2.0), ("sabrosa", 2.0),
            ("rico", 1.5), ("rica", 1.5),
            ("genial", 2.0), ("geniales", 2.0),
            ("súper", 1.5), ("super", 1.5),
            ("rápido", 1.5), ("rapido", 1.5), ("rápida", 1.5), ("rapida", 1.5),
            ("eficiente", 1.8), ("eficientes", 1.8),
            ("amable", 2.0), ("amables", 2.0),
            ("gran", 1.5), ("grandes", 1.5),
            ("mejor", 2.0), ("mejores", 2.0),
            ("satisfecho", 2.0), ("satisfecha", 2.0),
            ("contento", 1.8), ("contenta", 1.8),
            ("encantado", 2.2), ("encantada", 2.2),
            ("encanta", 2.0), ("encantan", 2.0),
            ("favorito", 2.0), ("favorita", 2.0),
            ("bonito", 1.5), ("bonita", 1.5),
            ("lindo", 1.5), ("linda", 1.5),
            ("agradable", 1.5), ("agradables", 1.5),
            ("cómodo", 1.5), ("comodo", 1.5),
            ("divino", 2.0), ("divina", 2.0),
            ("precioso", 2.0), ("preciosa", 2.0),
            ("hermoso", 2.0), ("hermosa", 2.0),
            ("impecable", 2.5), ("impecables", 2.5),
            ("higiénico", 1.5), ("higienico", 1.5),
            ("limpio", 1.5), ("limpia", 1.5),
            ("organizado", 1.5), ("organizada", 1.5),
            ("profesional", 2.0), ("profesionales", 2.0),
            ("calidad", 1.5),
            ("recomiendo", 2.0),
            ("volvería", 2.0), ("volveria", 2.0), ("volveré", 2.0), ("volvere", 2.0),
            ("gustó", 1.8), ("gusto", 1.8), ("gusta", 1.5), ("gustaron", 1.8),
            ("agradezco", 1.5), ("gracias", 1.5),
            ("feliz", 2.0), ("felices", 2.0),
            ("alegre", 1.5),
            ("simpático", 1.5), ("simpatico", 1.5),
            ("atento", 1.5), ("atenta", 1.5),
            ("servicial", 1.5),
            ("completo", 1.5), ("completa", 1.5),
            ("fresco", 1.5), ("fresca", 1.5),
            ("variedad", 1.5),
            ("recomendado", 1.5), ("recomendada", 1.5),
            ("confiable", 1.5),
            ("seguro", 1.0), ("segura", 1.0),
        ]

        positive_phrases = [
            ("rápida entrega", 2.0), ("rapida entrega", 2.0),
            ("buena atención", 2.5), ("buena atencion", 2.5),
            ("buen servicio", 2.5),
            ("excelente atención", 3.0), ("excelente atencion", 3.0),
            ("excelente servicio", 3.0),
            ("muy amable", 2.5), ("muy amables", 2.5),
            ("súper amable", 2.8), ("super amable", 2.8),
            ("lo recomiendo", 2.5),
            ("vale la pena", 2.0),
            ("me encantó", 2.8), ("me encanto", 2.8), ("me encanta", 2.5),
            ("me gustó", 2.0), ("me gusto", 2.0), ("me gusta", 1.8),
            ("muy bueno", 2.3), ("muy buena", 2.3),
            ("muy bien", 2.3),
            ("bastante bien", 2.0),
            ("buena calidad", 2.5),
            ("excelente calidad", 3.0),
            ("buen precio", 2.0),
            ("excelente opción", 2.8), ("excelente opcion", 2.8),
            ("buena opción", 2.0), ("buena opcion", 2.0),
            ("buena relación calidad", 2.5), ("buena relacion calidad", 2.5),
            ("lo máximo", 2.5), ("lo maximo", 2.5),
            ("súper bien", 2.5), ("super bien", 2.5),
            ("todo perfecto", 2.8),
            ("sin problema", 1.5), ("sin problemas", 1.5),
            ("bien preparado", 1.8), ("bien preparada", 1.8),
            ("bien servido", 1.8), ("bien servida", 1.8),
            ("atención excelente", 3.0), ("atencion excelente", 3.0),
            ("servicio excelente", 3.0),
            ("muy rico", 2.3), ("muy rica", 2.3),
        ]

        negative = [
            ("malo", -2.0), ("mala", -2.0), ("malos", -2.0), ("malas", -2.0),
            ("mal", -1.5),
            ("pésimo", -3.0), ("pesimo", -3.0), ("pésima", -3.0), ("pesima", -3.0),
            ("horrible", -3.0), ("horribles", -3.0),
            ("terrible", -2.5), ("terribles", -2.5),
            ("fatal", -2.8),
            ("decepcionante", -2.5), ("decepcionantes", -2.5),
            ("decepcionado", -2.5), ("decepcionada", -2.5),
            ("horroroso", -2.8), ("horrorosa", -2.8),
            ("horrendo", -3.0), ("horrenda", -3.0),
            ("desastre", -3.0),
            ("feo", -1.5), ("fea", -1.5),
            ("desagradable", -2.5), ("desagradables", -2.5),
            ("asco", -3.0),
            ("asqueroso", -3.0), ("asquerosa", -3.0),
            ("sucio", -2.0), ("sucia", -2.0),
            ("desordenado", -2.0), ("desordenada", -2.0),
            ("lento", -1.5), ("lenta", -1.5),
            ("demorado", -1.5), ("demorada", -1.5),
            ("tardó", -1.5), ("tardo", -1.5),
            ("molesto", -2.0), ("molesta", -2.0),
            ("enfadado", -2.0), ("enfadada", -2.0),
            ("enojado", -2.0), ("enojada", -2.0),
            ("fastidio", -2.0),
            ("frustrado", -2.5), ("frustrada", -2.5),
            ("frustrante", -2.5),
            ("incómodo", -1.8), ("incomodo", -1.8),
            ("caro", -1.5), ("cara", -1.5),
            ("roto", -2.0), ("rota", -2.0),
            ("dañado", -2.0), ("dañada", -2.0), ("danado", -2.0), ("danada", -2.0),
            ("maltrato", -2.5),
            ("grosero", -2.5), ("grosera", -2.5),
            ("maleducado", -2.5), ("maleducada", -2.5),
            ("irrespetuoso", -2.8), ("irrespetuosa", -2.8),
            ("fracaso", -2.5),
            ("inaceptable", -3.0),
            ("intolerable", -2.8),
            ("insoportable", -2.5),
            ("pesado", -1.5), ("pesada", -1.5),
            ("aburrido", -1.5), ("aburrida", -1.5),
            ("malísimo", -3.0), ("malisimo", -3.0),
            ("quemado", -2.0), ("quemada", -2.0),
            ("crudo", -1.5), ("cruda", -1.5),
            ("insípido", -2.0), ("insipido", -2.0),
            ("frío", -1.5), ("frio", -1.5),
            ("duro", -1.5), ("dura", -1.5),
            ("incompleto", -1.5), ("incompleta", -1.5),
            ("faltó", -1.5), ("falto", -1.5),
            ("error", -1.5), ("errores", -1.5),
            ("equivocado", -1.5), ("equivocada", -1.5),
            ("pobre", -1.5),
        ]

        negative_phrases = [
            ("pésimo servicio", -3.5), ("pesimo servicio", -3.5),
            ("mal servicio", -3.0),
            ("mala atención", -3.0), ("mala atencion", -3.0),
            ("pésima atención", -3.5), ("pesima atencion", -3.5),
            ("mala calidad", -3.0),
            ("pésima calidad", -3.5), ("pesima calidad", -3.5),
            ("mal sabor", -2.5),
            ("sabor horrible", -3.5),
            ("no sabe bien", -2.5),
            ("no sabía bien", -2.5), ("no sabia bien", -2.5),
            ("sabor feo", -2.5),
            ("no vuelvo", -3.0),
            ("no volvería", -3.0), ("no volveria", -3.0),
            ("no recomiendo", -3.0),
            ("no lo recomiendo", -3.5),
            ("nunca más", -3.0), ("nunca mas", -3.0),
            ("pérdida de dinero", -3.5), ("perdida de dinero", -3.5),
            ("pérdida de tiempo", -3.0), ("perdida de tiempo", -3.0),
            ("tiempo perdido", -3.0),
            ("mala experiencia", -3.0),
            ("pésima experiencia", -3.5), ("pesima experiencia", -3.5),
            ("muy malo", -3.0), ("muy mala", -3.0),
            ("demasiado caro", -3.0), ("demasiado cara", -3.0),
            ("dejó mucho que desear", -2.5), ("dejo mucho que desear", -2.5),
            ("no me gustó", -2.5), ("no me gusto", -2.5),
            ("no me gusta", -2.0),
            ("no funciona", -2.5),
            ("llegó tarde", -2.0), ("llego tarde", -2.0),
            ("llegó frío", -2.5), ("llego frio", -2.5),
            ("sin sabor", -2.0),
        ]

        lex.update(positive)
        lex.update(positive_phrases)
        lex.update(negative)
        lex.update(negative_phrases)
        return lex

    def analyze(self, text: str) -> float:
        text_lower = text.lower().strip()
        if not text_lower:
            return 0.0

        sorted_terms = sorted(self._lexicon.items(), key=lambda x: len(x[0]), reverse=True)
        pos_score = 0.0
        neg_score = 0.0
        remaining = text_lower

        for term, score in sorted_terms:
            pattern = re.compile(r'\b' + re.escape(term) + r'\b')
            match = pattern.search(remaining)
            if match:
                if score > 0:
                    pos_score += score
                else:
                    neg_score += abs(score)
                remaining = remaining[:match.start()] + remaining[match.end():]

        if pos_score == 0 and neg_score == 0:
            return 0.0

        total = pos_score + neg_score
        return (pos_score - neg_score) / total if total > 0 else 0.0
