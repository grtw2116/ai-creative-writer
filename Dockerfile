FROM ollama/ollama
COPY models /models/

RUN nohup bash -c "ollama serve &" && sleep 5 && ollama create vecteus -f /models/vecteus-v1/Modelfile
RUN nohup bash -c "ollama serve &" && sleep 5 && ollama create ninja -f /models/ninja-v1-nsfw-128k/Modelfile
EXPOSE 11434
ENTRYPOINT ["ollama"]
CMD ["serve"]
