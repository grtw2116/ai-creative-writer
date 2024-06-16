FROM ollama/ollama
COPY models /models/

RUN nohup bash -c "ollama serve &" && sleep 5 && ollama create vecteus-v1 -f /models/vecteus-v1/Modelfile
RUN nohup bash -c "ollama serve &" && sleep 5 && ollama create vecteus-v2 -f /models/vecteus-v2/Modelfile
RUN nohup bash -c "ollama serve &" && sleep 5 && ollama create ninja-v1 -f /models/ninja-v1-nsfw-128k/Modelfile
RUN nohup bash -c "ollama serve &" && sleep 5 && ollama create ninja-v2 -f /models/ninja-v2-nsfw-128k/Modelfile

EXPOSE 11434
ENTRYPOINT ["ollama"]
CMD ["serve"]
