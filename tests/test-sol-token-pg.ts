import * as anchor from "@coral-xyz/anchor";
import * as web3 from '@solana/web3.js';
import { Program } from "@coral-xyz/anchor";
import { TestSolTokenPg } from "../target/types/test_sol_token_pg";
import { assert } from "chai";
import { BN } from 'bn.js';


describe("test-sol-token-pg", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.TestSolTokenPg as anchor.Program<TestSolTokenPg>;

  // set constants
  const PROGRAM_ID = program.programId;
  const METADATA_SEED = 'metadata';
  const TOKEN_METADATA_PROGRAM_ID = new web3.PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');
  const MINT_SEED = "mint";

  const payer = provider.wallet.publicKey;

  const metadata = {
    name: 'Test Sol Token',
    symbol: 'TEST',
    uri: "https://5vfxc4tr6xoy23qefqbj4qx2adzkzapneebanhcalf7myvn5gzja.arweave.net/7UtxcnH13Y1uBCwCnkL6APKsge0hAgacQFl-zFW9NlI",
    decimals: 9,
  };

  const mintAmount = 10;

  const [mint] = web3.PublicKey.findProgramAddressSync(
    [Buffer.from(MINT_SEED)],
    PROGRAM_ID,
  );

  const [metadataAddress] = web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from(METADATA_SEED),
      TOKEN_METADATA_PROGRAM_ID.toBuffer(),
      mint.toBuffer(),
    ],
    TOKEN_METADATA_PROGRAM_ID
  );

    // Helper function to confirm transactions
    async function confirmTransaction(
        connection: web3.Connection,
        signature: web3.TransactionSignature,
        desiredConfirmationStatus: web3.TransactionConfirmationStatus = 'confirmed',
        timeout: number = 30000,
        pollInterval: number = 1000,
        searchTransactionHistory: boolean = false
    ): Promise<anchor.web3.SignatureStatus> {
        const start = Date.now();

        while (Date.now() - start < timeout) {
            const { value: statuses } = await connection.getSignatureStatuses([signature], { searchTransactionHistory });

            if (!statuses || statuses.length === 0) {
                throw new Error('Failed to get signature status');
            }

            const status = statuses[0];

            if (status === null) {
                await new Promise(resolve => setTimeout(resolve, pollInterval));
                continue;
            }

            if (status.err) {
                throw new Error(`Transaction failed: ${JSON.stringify(status.err)}`);
            }

            if (status.confirmationStatus && status.confirmationStatus === desiredConfirmationStatus) {
                return status;
            }

            if (status.confirmationStatus === 'finalized') {
                return status;
            }

            await new Promise(resolve => setTimeout(resolve, pollInterval));
        }

        throw new Error(`Transaction confirmation timeout after ${timeout}ms`);
    }



  it("Is initialized", async () => {

    const info = await provider.connection.getAccountInfo(PROGRAM_ID);
    console.log(info, "info");

    // console.log(" Mint not found. Attempting to initialize.");

    try {

      const context = {
        metadata: metadataAddress,
        mint,
        payer,
        rent: web3.SYSVAR_RENT_PUBKEY,
        systemProgram: web3.SystemProgram.programId,
        tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
        tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
      };

      const txHash = await program.methods
          .initToken(metadata)
          .accounts(context)
          .rpc();
      
      await confirmTransaction(provider.connection, txHash, 'finalized');
      console.log("link to tx: ",`https://explorer.solana.com/tx/${txHash}?cluster=devnet`);

      // const newInfo = await provider.connection.getAccountInfo(mint);
      // console.log("mint should be init", newInfo);
    } catch (error) {
      if (error instanceof anchor.web3.SendTransactionError) {
            console.error("Transaction simulation failed:", error.message);
            console.error("Logs:", error.logs);
      }
        throw error;
      }
  });

  it("mint tokens", async () => {

    // const info = await provider.connection.getAccountInfo(mint);
    // console.log(info, "info");

    //  const destination = await anchor.utils.token.associatedAddress({
    //   mint: mint,
    //   owner: payer,
    // });

    // let initialBalance: number;
    // try {
    //   const balance = (await provider.connection.getTokenAccountBalance(destination))
    //   initialBalance = balance.value.uiAmount;
    // } catch {
    //   // Token account not yet initiated has 0 balance
    //   initialBalance = 0;
    // } 
    
    // const context = {
    //   mint,
    //   destination,
    //   payer,
    //   rent: web3.SYSVAR_RENT_PUBKEY,
    //   systemProgram: web3.SystemProgram.programId,
    //   tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
    //   associatedTokenProgram: anchor.utils.token.ASSOCIATED_PROGRAM_ID,
    // };

    // const txHash = await program.methods
    //   .mintTokens(new BN(mintAmount * 10 ** metadata.decimals))
    //   .accounts(context)
    //   .rpc();
    
  //   await confirmTransaction(provider.connection, txHash);
  //   console.log(`  https://explorer.solana.com/tx/${txHash}?cluster=devnet`);

  //   const postBalance = (
  //     await provider.connection.getTokenAccountBalance(destination)
  //   ).value.uiAmount;
  //   assert.equal(
  //     initialBalance + mintAmount,
  //     postBalance,
  //     "Post balance should equal initial plus mint amount"
  //   );
  });

});
