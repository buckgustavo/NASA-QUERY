package main

import (
	"fmt"
	"io"
	"net/http"
)

func main() {
	const nasaURL = "https://exoplanetarchive.ipac.caltech.edu/TAP/sync?query=select+hostname,disc_year,discoverymethod,disc_facility+from+ps&format=csv"
	const port = "8080"

	http.HandleFunc("/exoplanets", func(w http.ResponseWriter, r *http.Request) {
		fmt.Println("--> Recebi um pedido do seu Navegador!")

		// Configuracao CORS
		w.Header().Set("Access-Control-Allow-Origin", "*")

		fmt.Println("--> Buscando dados na NASA... (Isso pode demorar uns 20 segundos)")
		resp, err := http.Get(nasaURL)
		if err != nil {
			fmt.Println("Erro ao conectar na NASA:", err)
			http.Error(w, "Falha na NASA", 500)
			return
		}
		defer resp.Body.Close()

		fmt.Println("--> Dados recebidos! Enviando para o seu site...")
		io.Copy(w, resp.Body)
		fmt.Println("--> Sucesso! Tabela enviada.")
	})

	fmt.Println("================================================")
	fmt.Println("SERVIDOR PROXY DA NASA ESTÁ ATIVO!")
	fmt.Println("Porta: " + port)
	fmt.Println("Mantenha este terminal aberto.")
	fmt.Println("================================================")

	err := http.ListenAndServe(":"+port, nil)
	if err != nil {
		fmt.Println("Erro ao subir o servidor:", err)
	}
}
