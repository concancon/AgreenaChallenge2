import { ValidationError } from "class-validator";
import { DataSource } from "typeorm";

export const disconnectAndClearDatabase = async (ds: DataSource): Promise<void> => {
  await clearDatabase(ds);
  await ds.destroy();
};

export const clearDatabase = async (ds: DataSource): Promise<void> => {
  const { entityMetadatas } = ds;

  await Promise.all(entityMetadatas.map(data => ds.query(`truncate table "${data.tableName}" cascade`)));
};

export const getErrorMessages = (errors: ValidationError[]): string => {
  return errors
    .reduce((messages: string[], currentValue: ValidationError) => {
      if (currentValue.constraints == null) {
        return messages;
      }

      Object.values(currentValue.constraints).forEach(value => {
        messages.push(value);
      });

      return messages;
    }, [])
    .join(", ");
};
