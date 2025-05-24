const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Noticias", function () {
  let contrato;
  let owner, user1, user2, user3, user4, user5;

  beforeEach(async function () {
    const Noticias = await ethers.getContractFactory("Noticias");
    contrato = await Noticias.deploy();
    await contrato.waitForDeployment();

    [owner, user1, user2, user3, user4, user5] = await ethers.getSigners();
  });

  it("deve validar uma notícia como verdadeira com maioria de votos verdadeiros", async function () {
    const link = "https://fake.com/noticia";

    // 3 votos verdadeiros
    await contrato.connect(user1).votar(link, true);
    await contrato.connect(user2).votar(link, true);
    await contrato.connect(user3).votar(link, true);

    // 2 votos falsos
    await contrato.connect(user4).votar(link, false);
    await contrato.connect(user5).votar(link, false);

    const [veredito, timestamp] = await contrato.verNoticia(link);
    expect(veredito).to.equal(1); // Veredito.Verdadeira

    // Checar reputações
    expect(await contrato.reputacao(user1.address)).to.equal(1);
    expect(await contrato.reputacao(user2.address)).to.equal(1);
    expect(await contrato.reputacao(user3.address)).to.equal(1);
    expect(await contrato.reputacao(user4.address)).to.equal(-1);
    expect(await contrato.reputacao(user5.address)).to.equal(-1);
  });

  it("deve validar uma notícia como falsa com maioria de votos falsos", async function () {
    const link = "https://fake.com/noticia2";

    // 2 votos verdadeiros
    await contrato.connect(user1).votar(link, true);
    await contrato.connect(user2).votar(link, true);

    // 3 votos falsos
    await contrato.connect(user3).votar(link, false);
    await contrato.connect(user4).votar(link, false);
    await contrato.connect(user5).votar(link, false);

    const [veredito, timestamp] = await contrato.verNoticia(link);
    expect(veredito).to.equal(2); // Veredito.Falsa

    expect(await contrato.reputacao(user1.address)).to.equal(-1);
    expect(await contrato.reputacao(user2.address)).to.equal(-1);
    expect(await contrato.reputacao(user3.address)).to.equal(1);
    expect(await contrato.reputacao(user4.address)).to.equal(1);
    expect(await contrato.reputacao(user5.address)).to.equal(1);
  });

  it("não deve permitir votar em notícia já validada", async function () {
    const link = "https://fake.com/noticia3";

    for (let i = 0; i < 5; i++) {
      await contrato.connect((await ethers.getSigners())[i]).votar(link, true);
    }

    // tentativa de votar após validação
    await expect(
      contrato.connect(user5).votar(link, false)
    ).to.be.revertedWith("Noticia ja validada");
  });
});
