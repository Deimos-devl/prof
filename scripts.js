document.addEventListener("DOMContentLoaded", () => {
    const produtos = {
        injetaveis: {
            "Enantato de testosterona": 130,
            "Durateston": 130,
            "Propionato de testosterona": 130,
            "Cipionato de testosterona": 130,
            "Deca": 130,
            "NPP": 130,
            "Boldenona": 130,
            "Trembolona acetato": 160,
            "Trembolona enantato": 160,
            "Masteron": 150,
        },
        orais: {
            "Stanozolol 10mg/100caps": 90,
            "Hemogenin 50mg/30caps": 90,
            "Proviron 25mg/30caps": 90,
            "Dianabol 10mg/100caps": 90,
            "Oxandrolona 5mg/100caps": 120,
            "Oxandrolona 10mg/100caps": 140,
            "Oxandrolona 20mg/100caps": 180,
        },
    };

    const formatter = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2,
    });

    function formatarMoeda(valor) {
        return formatter.format(valor).replace(/\s/g, "");
    }

    const combos = [
        {
            nome: "COMBO 1",
            preco: 559.99,
            condicao: (q) => q === 5,
            brindes: 0,

        },
        {
            nome: "COMBO 2",
            preco: 1109.99,
            condicao: (q) => q === 10,
            brindes: 1,
        },
        {
            nome: "COMBO 3",
            preco: 1909.99,
            condicao: (q) => q === 18,
            brindes: 2,
            adicionais: ["regata de brinde"]
        }
    ];

    function preencherProdutos() {
        const injetaveisContainer = document.getElementById("injetaveis");
        const oraisContainer = document.getElementById("orais");

        function criarProduto(nome, preco, container) {
            const div = document.createElement("div");
            div.classList.add("produto");
            div.innerHTML = `
                <span>${nome}</span>
                <span>${formatarMoeda(preco)}</span>
                <div class="produto-controls">
                    <button class="btn-ajustar" onclick="ajustarQuantidade(this, -1)">-</button>
                    <input type="number" min="0" value="0">
                    <button class="btn-ajustar" onclick="ajustarQuantidade(this, 1)">+</button>
                </div>`;
            container.appendChild(div);
        }

        Object.entries(produtos.injetaveis).forEach(([nome, preco]) => {
            criarProduto(nome, preco, injetaveisContainer);
        });

        Object.entries(produtos.orais).forEach(([nome, preco]) => {
            criarProduto(nome, preco, oraisContainer);
        });
    }

    window.ajustarQuantidade = function (button, delta) {
        const input = button.parentElement.querySelector("input");
        input.value = Math.max(0, parseInt(input.value) + delta);
    }

    document.getElementById("aplicar-desconto").addEventListener("change", function () {
        const descontoInput = document.getElementById("porcentagem-desconto");
        descontoInput.disabled = !this.checked;
        if (!this.checked) descontoInput.value = 0;
    });

    document.getElementById("gerar-orcamento").addEventListener("click", () => {
        let total = 0;
        const produtosSelecionados = [];
        const modoCombo = document.querySelector("input[name='modo']:checked").value === "combo";
        const desconto = parseFloat(document.getElementById("porcentagem-desconto").value) || 0;
        const valorFreteManual = parseFloat(document.getElementById("valor-frete").value) || 0;

        document.querySelectorAll("#injetaveis .produto, #orais .produto").forEach((div) => {
            const quantidade = parseInt(div.querySelector("input").value);
            if (quantidade > 0) {
                const nome = div.querySelector("span:first-child").textContent;
                const preco = parseFloat(div.querySelector("span:nth-child(2)").textContent.replace("R$", "").replace(",", "."));
                produtosSelecionados.push({ nome, quantidade, preco });
            }
        });

        const totalProdutos = produtosSelecionados.reduce((acc, p) => acc + p.quantidade, 0);

        if (modoCombo) {
            const combo = combos.find(c => c.condicao(totalProdutos));
            if (combo) {
                total = combo.preco + valorFreteManual;

                const mensagem = 
`Total de ${formatarMoeda(total)} já com o frete incluso (Transportadora) 
🔥 Nossa garantia é 100% gratuita! 🔥

Seu novo pedido será 📦:
${produtosSelecionados.map(p => `${p.quantidade}x ${p.nome}`).join("\n")}

${combo.brindes > 0 ? `+ ${combo.brindes} produtos de brinde` : ""}
${combo.adicionais.length ? `+ ${combo.adicionais.join(", ")}` : ""}

Podemos fechar o seu pedido?`;

                navigator.clipboard.writeText(mensagem).then(() => {
                    alert("Orçamento copiado!");
                    resetarQuantidades();
                });
            } else {
                alert("A quantidade de produtos não corresponde a nenhum combo (5, 10 ou 18).");
            }
        } else {
            produtosSelecionados.forEach(p => {
                total += p.quantidade * p.preco;
            });

            if (desconto > 0) {
                total -= total * (desconto / 100);
            }

            total += valorFreteManual;

            const mensagem = 
`Total de ${formatarMoeda(total)} já com o frete incluso (Transportadora) 
🔥 Nossa garantia é 100% gratuita! 🔥

Seu novo pedido será 📦:
${produtosSelecionados.map(p => `${p.quantidade}x ${p.nome} ${formatarMoeda(p.quantidade * p.preco)}`).join("\n")}

Podemos fechar o seu pedido?`;

            navigator.clipboard.writeText(mensagem).then(() => {
                alert("Orçamento copiado!");
                resetarQuantidades();
            });
        }
    });

    function resetarQuantidades() {
        document.querySelectorAll("input[type='number']").forEach(input => {
            if (!input.id.includes("frete") && !input.id.includes("desconto")) {
                input.value = 0;
            }
        });
    }

    preencherProdutos();
});
