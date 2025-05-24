// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Noticias {

    enum Veredito { Nenhum, Verdadeira, Falsa }

    struct Voto {
        address votante;
        bool voto;
        uint256 timestamp;
    }

    struct NoticiaValidada {
        Veredito vereditoFinal;
        uint256 timestampValidacao;
    }

    mapping(address => int) public reputacao;

    mapping(string => Voto[]) public votosPorLink;

    mapping(string => NoticiaValidada) public noticiasValidas;

    uint public votosNecessarios = 5;

    event NovoVoto(address votante, string link, bool voto);
    event ValidacaoNoticia(string link, Veredito resultado);

    function votar(string memory link, bool voto) public {
        require(noticiasValidas[link].timestampValidacao == 0, "Noticia ja validada");

        votosPorLink[link].push(Voto({
            votante: msg.sender,
            voto: voto,
            timestamp: block.timestamp
        }));

        emit NovoVoto(msg.sender, link, voto);

        if (votosPorLink[link].length >= votosNecessarios) {
            _validarNoticia(link);
        }
    }

    function _validarNoticia(string memory link) internal {
        uint verdadeiros = 0;
        uint falsos = 0;

        for (uint i = 0; i < votosPorLink[link].length; i++) {
            if (votosPorLink[link][i].voto) {
                verdadeiros++;
            } else {
                falsos++;
            }
        }

        Veredito resultado = verdadeiros >= falsos ? Veredito.Verdadeira : Veredito.Falsa;

        noticiasValidas[link] = NoticiaValidada({
            vereditoFinal: resultado,
            timestampValidacao: block.timestamp
        });

        for (uint i = 0; i < votosPorLink[link].length; i++) {
            address addr = votosPorLink[link][i].votante;
            bool voto = votosPorLink[link][i].voto;

            if ((resultado == Veredito.Verdadeira && voto) || (resultado == Veredito.Falsa && !voto)) {
                reputacao[addr] += 1;
            } else {
                reputacao[addr] -= 1;
            }
        }

        emit ValidacaoNoticia(link, resultado);
    }

    function verNoticia(string memory link) public view returns (Veredito, uint256) {
        NoticiaValidada memory n = noticiasValidas[link];
        return (n.vereditoFinal, n.timestampValidacao);
    }
}
