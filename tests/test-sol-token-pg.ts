import * as anchor from '@coral-xyz/anchor';
import { getAssociatedTokenAddressSync } from '@solana/spl-token';
import { Keypair } from '@solana/web3.js';
import type { TestSolTokenPg } from '../target/types/test_sol_token_pg';
import { PublicKey, SystemProgram} from '@solana/web3.js';

describe('SPL Token Minter', () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const payer = provider.wallet as anchor.Wallet;
  // const payer = new Keypair();
  const program = anchor.workspace.testSolTokenPg as anchor.Program<TestSolTokenPg>;

  // Generate new keypair to use as address for mint account.
  const mintKeypair = new Keypair();

  const TOKEN_METADATA_PROGRAM_ID = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");

  const [metadataAddress] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('metadata'),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        mintKeypair.publicKey.toBuffer(),
      ],
      TOKEN_METADATA_PROGRAM_ID
    );

  const metadata = {
    name: 'Solana Gold',
    symbol: 'GOLDSOL',
    uri: 'https://raw.githubusercontent.com/solana-developers/program-examples/new-examples/tokens/tokens/.assets/spl-token.json',
  };


  it('Create an SPL Token!', async () => {
    const info = await provider.connection.getAccountInfo(TOKEN_METADATA_PROGRAM_ID);
    console.log("payer", info)
    console.log("payer", TOKEN_METADATA_PROGRAM_ID)

    // console.log("minter", mintKeypair.publicKey)
    // return;



    const transactionSignature = await program.methods
      .createToken(metadata.name, metadata.symbol, metadata.uri)
      .accounts({
        payer: payer.publicKey,
        mintAccount: mintKeypair.publicKey,
        // metadataAccount: metadataAddress,
        tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
        tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .signers([payer.payer, mintKeypair])
      .rpc();

    console.log('Success!');
    console.log(`   Mint Address: ${mintKeypair.publicKey}`);
    console.log(`   Transaction Signature: ${transactionSignature}`);
  });

  // it('Mint some tokens to your wallet!', async () => {
  //   // Derive the associated token address account for the mint and payer.
  //   const associatedTokenAccountAddress = getAssociatedTokenAddressSync(mintKeypair.publicKey, payer.publicKey);

  //   // Amount of tokens to mint.
  //   const amount = new anchor.BN(100);

  //   // Mint the tokens to the associated token account.
  //   const transactionSignature = await program.methods
  //     .mintToken(amount)
  //     .accounts({
  //       mintAuthority: payer.publicKey,
  //       recipient: payer.publicKey,
  //       mintAccount: mintKeypair.publicKey,
  //       associatedTokenAccount: associatedTokenAccountAddress,
  //     })
  //     .rpc();

  //   console.log('Success!');
  //   console.log(`   Associated Token Account Address: ${associatedTokenAccountAddress}`);
  //   console.log(`   Transaction Signature: ${transactionSignature}`);
  // });
});



