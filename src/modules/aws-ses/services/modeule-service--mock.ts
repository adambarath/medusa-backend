import { Lifetime, AwilixContainer } from "awilix";
import * as aws from "@aws-sdk/client-ses";
import path from "path";
import fs from "fs";
import { readdir } from "node:fs/promises";
import { exec } from "child_process";
import { MedusaError, ContainerRegistrationKeys } from "@medusajs/utils";
import { ITransactionBaseService } from "@medusajs/types";
import validEvents from "../constants/validEvents";
import Handlebars from "handlebars";
import nodemailer from "nodemailer";
import { SESOptions } from "./awsses-module-service";

export default class moduleService implements ITransactionBaseService {
  constructor(
    options: SESOptions    
  ) {
    console.log(
      "-----------------------------------MOCK moduleService MOCK--------------------------------------"
    );
    
    console.log(options);
    console.log(JSON.stringify(options));
    console.log();
  }
}
