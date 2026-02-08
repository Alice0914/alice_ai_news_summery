
from sentence_transformers import CrossEncoder

model = CrossEncoder('cross-encoder/stsb-roberta-large')
title1 = "From Svedka to Anthropic, brands make bold plays with AI in Super Bowl ads"
title2 = "Crypto.com places $70M bet on AI.com domain ahead of Super Bowl"

score = model.predict([(title1, title2)])[0]
print(f"Similarity Score: {score}")
